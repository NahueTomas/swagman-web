// @ts-ignore
import SwaggerClient from "swagger-client";
import { action, makeObservable, observable } from "mobx";

import {
  OpenAPIComponents,
  OpenAPIExternalDocumentation,
  OpenAPIInfo,
  OpenAPIOperation,
  OpenAPIPath,
  OpenAPIPaths,
  OpenAPISecurityRequirement,
  OpenAPIServer,
  OpenAPISpec,
  OpenAPITag,
} from "../shared/types/openapi";

import { ParameterModel } from "./parameter.model";
import { RequestBodyMediaType } from "./request-body-media-type";
import { getDefaultServer } from "./helpers/get-default-server";

import { OperationModel } from "@/models/operation.model";
import { SwaggerConverter } from "@/lib/swagger-converter";
import { ServerModel } from "@/models/server.model";
import { getStatusCodeName } from "@/shared/utils/helpers";
import { Value } from "@/shared/types/parameter-value";

export class SpecModel {
  public processed: boolean;
  public openapi: string;
  public info: OpenAPIInfo;
  public paths: OpenAPIPaths;
  public components: OpenAPIComponents;
  public security: Array<OpenAPISecurityRequirement>;
  public tags: Array<OpenAPITag>;
  public externalDocs: OpenAPIExternalDocumentation | null;

  public client: SwaggerClient;

  public servers: Array<ServerModel>;
  public selectedServer: ServerModel;

  // Cache for expensive operations
  private operations: Array<OperationModel>;
  private tagList: Array<{
    title: string;
    description?: string;
    operationsResume: { id: string; title: string; method: string }[];
  }>;

  // Flags to know if they have been generated (memoization)
  private _operationsGenerated: boolean = false;
  private _tagListGenerated: boolean = false;

  constructor() {
    this.processed = false;
    this.openapi = "";
    this.info = { title: "", version: "" };
    this.paths = {};
    this.components = {};
    this.security = [];
    this.tags = [];
    this.externalDocs = null;

    this.servers = [];
    this.selectedServer = getDefaultServer();
    this.operations = [];
    this.tagList = [];
    this._operationsGenerated = false;
    this._tagListGenerated = false;

    makeObservable(this, {
      selectedServer: observable.ref,
      setSelectedServer: action,
    });
  }

  public async processSpec(config: string | object) {
    const obj: { url?: string; spec?: object } = {};

    if (typeof config === "string") obj.url = config;
    else obj.spec = config;

    const client = await SwaggerClient.resolve(obj);
    let spec: OpenAPISpec;

    if (!client?.spec?.openapi?.startsWith("3."))
      spec = await SwaggerConverter.convert(client.spec);
    else spec = client.spec;

    this.client = client;
    this.client.spec = spec;
    this.processed = true;

    this.openapi = spec.openapi;
    this.info = spec.info;
    this.paths = spec.paths;
    this.components = spec.components || {};
    this.security = spec.security || [];
    this.tags = spec.tags || [];

    this.servers = this.generateServers(spec.servers || []);
    this.selectedServer = this.servers[0];

    // Reset cache flags when processing new spec
    this._operationsGenerated = false;
    this._tagListGenerated = false;
  }

  private generateServers(servers: OpenAPIServer[]) {
    if (!this.processed) throw new Error("Spec not processed");

    // Default server
    if (!servers.length) return [getDefaultServer()];

    const generatedServers: Array<ServerModel> = [];

    for (const server of servers) {
      generatedServers.push(
        new ServerModel(server.url, server.description, server.variables)
      );
    }

    return generatedServers;
  }

  public getSelectedServer(): ServerModel {
    if (!this.processed) throw new Error("Spec not processed");

    return this.selectedServer;
  }

  public setSelectedServer(url: string): void {
    if (!this.processed) throw new Error("Spec not processed");

    const server = this.servers.find((s) => s.getUrl() === url);

    if (server) this.selectedServer = server;
  }

  public getServers(): ServerModel[] {
    return this.servers;
  }

  private generateOperations() {
    if (!this.processed) throw new Error("Spec not processed");

    const operations: Array<OperationModel> = [];
    const operationList: string[] = [];

    for (const path in this.paths) {
      const pathItem = this.paths[path];

      for (const method in pathItem) {
        const operation = pathItem[method as keyof OpenAPIPath];
        const operationModel = new OperationModel(
          path,
          method,
          operation as OpenAPIOperation
        );

        if (operationList.includes(operationModel.id)) continue;
        operations.push(operationModel);
        operationList.push(operationModel.id);
      }
    }

    return operations;
  }

  private generateTagList() {
    if (!this.processed) throw new Error("Spec not processed");

    // Ensure operations are generated first
    if (!this._operationsGenerated) {
      this.operations = this.generateOperations();
      this._operationsGenerated = true;
    }

    const tagsObj: {
      [title: string]: {
        title: string;
        description?: string;
        operationsResume: { id: string; title: string; method: string }[];
      };
    } = {};

    for (const tag of this.tags) {
      tagsObj[tag.name] = {
        title: tag.name,
        description: tag.description,
        operationsResume: [],
      };
    }

    const tagsFromOperations = this.operations
      .map((operation) => operation.tags)
      .flat()
      .map((tagName) => tagName);

    for (const tag of tagsFromOperations) {
      if (!tagsObj[tag]) {
        tagsObj[tag] = {
          title: tag,
          operationsResume: [],
        };
      }
    }

    for (const operation of this.operations) {
      for (const tag of operation.tags) {
        if (!tagsObj[tag]) {
          tagsObj[tag] = {
            title: tag,
            operationsResume: [],
          };
        }

        tagsObj[tag].operationsResume.push({
          id: operation.id,
          title: operation.operationId || operation.path,
          method: operation.method,
        });
      }
    }

    return Object.values(tagsObj);
  }

  public getOperations() {
    // Memoization: Only generate operations if they haven't been generated before
    if (!this._operationsGenerated) {
      this.operations = this.generateOperations();
      this._operationsGenerated = true;
    }

    return this.operations;
  }

  public getTagList() {
    // Memoization: Only generate tagList if it hasn't been generated before
    if (!this._tagListGenerated) {
      this.tagList = this.generateTagList();
      this._tagListGenerated = true;
    }

    return this.tagList;
  }

  public getVersion(): string {
    return this.openapi;
  }

  private buildRequestDependencies(
    requestBodyMediaType: RequestBodyMediaType | undefined,
    parameters: ParameterModel[]
  ) {
    if (!this.processed) throw new Error("Spec not processed");

    const parametersFormatted: { [key: string]: Value | Value[] } = {};

    // Nesting parameters
    parameters.forEach((param) => {
      if (param.getIn() === "header" && param.name.toLowerCase() === "accept")
        return;
      if (
        param.getIn() === "header" &&
        param.name.toLocaleLowerCase() === "content-type"
      )
        return;

      if (param.included) {
        parametersFormatted[`${param.getIn()}.${param.name}`] = param.value;
      }
    });

    let requestBodyFormatted:
      | string
      | { [key: string]: Value | Value[] }
      | undefined;

    if (
      requestBodyMediaType &&
      !Array.isArray(requestBodyMediaType.fields) &&
      (requestBodyMediaType as any).value
    ) {
      // Caso text/plain, application/json simple, etc
      requestBodyFormatted = (requestBodyMediaType as any).value;
    } else if (requestBodyMediaType?.fields?.length) {
      // Caso form-data o json con propiedades
      const obj: { [key: string]: Value | Value[] } = {};

      requestBodyMediaType.fields.forEach((f) => {
        if (f.included) obj[f.name] = f.value;
      });
      requestBodyFormatted = obj;
    }

    return {
      params: parametersFormatted,
      body:
        typeof requestBodyFormatted === "object" &&
        requestBodyFormatted &&
        Object.keys(requestBodyFormatted)?.length === 0
          ? null
          : requestBodyFormatted,
    };
  }

  public buildRequest(operation: OperationModel) {
    const requestBody = operation.getRequestBody();
    const contentType = operation.getContentType();
    const parameters = operation.getParameters();
    const server = operation.getSelectedServer() || this.getSelectedServer();

    const { params, body } = this.buildRequestDependencies(
      requestBody?.getMimeType(contentType?.value as string),
      parameters
    );

    const request = SwaggerClient.buildRequest({
      spec: this.client.spec,
      operationId: `${operation.method.toLowerCase()}-${operation.path}`,
      parameters: params,
      requestBody: body,
      requestContentType: contentType?.value,
      responseContentType: operation?.getAccept()?.value,
      mediaType: contentType?.value,
      responseInterceptor: (res: any) => {
        res.date = new Date().toLocaleString();
        res.statusText = getStatusCodeName(res.status);

        return res;
      },
      baseURL: server.getUrlWithVariables(),
    });

    return request;
  }

  public async makeRequest(operation: OperationModel) {
    try {
      const requestBody = operation.getRequestBody();
      const contentType = operation.getContentType();
      const parameters = operation.getParameters();
      const server = operation.getSelectedServer() || this.getSelectedServer();

      const { params, body } = this.buildRequestDependencies(
        requestBody?.getMimeType(contentType?.value as string),
        parameters
      );

      const request = await SwaggerClient.execute({
        spec: this.client.spec,
        operationId: `${operation.method.toLowerCase()}-${operation.path}`,
        parameters: params,
        requestBody: body,
        requestContentType: contentType?.value,
        responseContentType: operation?.getAccept()?.value,
        mediaType: contentType?.value,
        responseInterceptor: (res: any) => {
          res.date = new Date().toLocaleString();
          res.statusText = getStatusCodeName(res.status);

          return res;
        },
        baseURL: server.getUrlWithVariables(),
      });

      return request;
    } catch (error: any) {
      if (error.response) return error.response;
      throw error;
    }
  }
}
