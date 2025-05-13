// @ts-ignore
import SwaggerClient from "swagger-client";

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
} from "../types/openapi";

import { OperationModel } from "@/models/operation.model";
import { SwaggerConverter } from "@/lib/swagger-converter";
import { ParameterType } from "@/hooks/use-request-forms";
import { ServerModel } from "@/models/server.model";

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
  private operations: Array<OperationModel>;
  private tagList: Array<{
    title: string;
    description?: string;
    operationsResume: { id: string; title: string; method: string }[];
  }>;

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
    this.operations = [];
    this.tagList = [];
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

    // TODO: Improve this
    this.operations = this.generateOperations(
      typeof config === "string" ? config : undefined
    );
    this.tagList = this.generateTagList();
  }

  private generateServers(servers: OpenAPIServer[]) {
    if (!this.processed) throw new Error("Spec not processed");
    const generatedServers: Array<ServerModel> = [];

    for (const server of servers) {
      generatedServers.push(
        new ServerModel(server.url, server.description, server.variables)
      );
    }

    return generatedServers;
  }

  private generateOperations(specificationUrl?: string) {
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
          operation as OpenAPIOperation,
          specificationUrl
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
    return this.operations;
  }

  public getTagList() {
    return this.tagList;
  }

  public getVersion(): string {
    return this.openapi;
  }

  private buildRequestDependencies(
    requestBody: string | { [key: string]: any } | null,
    parameters: ParameterType
  ) {
    if (!this.processed) throw new Error("Spec not processed");
    let parametersFormatted = {};
    let responseContentType = "*/*";

    // Nesting parameters
    for (const key in parameters) {
      for (const param in parameters[key as keyof ParameterType]) {
        if (key === "header" && param === "Accept")
          responseContentType = parameters[key][param].value as string;
        if (key === "header" && param === "Content-Type") continue;
        else if (parameters[key as keyof ParameterType][param].included) {
          (parametersFormatted as Record<string, any>)[`${key}.${param}`] =
            parameters[key as keyof ParameterType][param].value;
        }
      }
    }

    let requestBodyFormatted: string | object = {};

    if (typeof requestBody === "string") requestBodyFormatted = requestBody;
    else
      for (const key in requestBody) {
        const typedKey = key as keyof typeof requestBody;

        if (requestBody[typedKey]?.included) {
          (requestBodyFormatted as Record<string, any>)[typedKey] =
            requestBody[typedKey].value;
        }
      }

    return {
      parameters: parametersFormatted,
      requestBody:
        typeof requestBodyFormatted === "object" &&
        Object.keys(requestBodyFormatted)?.length === 0
          ? null
          : requestBodyFormatted,
      responseContentType,
    };
  }

  public buildRequest(
    operation: OperationModel,
    requestBody: string | { [key: string]: any } | null,
    parameters: ParameterType,
    contentType: string | null
  ) {
    const {
      parameters: parametersF,
      requestBody: requestBodyF,
      responseContentType,
    } = this.buildRequestDependencies(requestBody, parameters);

    const objRequest: {
      [key: string]: string | object | null;
    } = {
      spec: this.client.spec,
      operationId: `${operation.method.toLowerCase()}-${operation.path}`,
      parameters: parametersF,
      responseContentType,
    };

    if (contentType && requestBodyF) {
      objRequest.requestContentType = contentType;
      objRequest.requestBody = requestBodyF;
    }

    const request = SwaggerClient.buildRequest(objRequest);

    return request;
  }

  public async makeRequest(
    operation: OperationModel,
    requestBody: string | { [key: string]: any } | null,
    parameters: ParameterType,
    contentType: string | null
  ): Promise<{
    body: { [key: string]: any } | string;
    data: string;
    headers: { [key: string]: string | string[] };
    obj: { [key: string]: any } | string;
    ok: boolean;
    status: number;
    statusText: string;
    text: string;
    url: string;
    date: Date;
  }> {
    try {
      const {
        parameters: parametersF,
        requestBody: requestBodyF,
        responseContentType,
      } = this.buildRequestDependencies(requestBody, parameters);

      const request = await SwaggerClient.execute({
        spec: this.client.spec,
        operationId: `${operation.method.toLowerCase()}-${operation.path}`,
        parameters: parametersF,
        requestBody: requestBodyF,
        responseContentType,
        mediaType: contentType,
        responseInterceptor: (res: any) => {
          res.date = new Date();

          return res;
        },
      });

      return request;
    } catch (error: any) {
      if (error.response) return error.response;
      throw error;
    }
  }
}
