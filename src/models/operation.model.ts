import type {
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPIServer,
} from "../shared/types/openapi";

import { action, makeObservable, observable } from "mobx";

import { ParameterModel } from "./parameter.model";
import { RequestBodyModel } from "./request-body.model";
import { ResponsesModel } from "./responses.model";
import { ServerModel } from "./server.model";
import { RequestResponseModel } from "./request-response.model";

export class OperationModel {
  public id: string;
  public path: string;
  public method: string;
  public tags: string[];

  private servers: ServerModel[] | null;
  public selectedServer: ServerModel | null;

  public summary: string;
  public description: string;
  public operationId: string | null;
  public deprecated: boolean;
  private parameters: Array<ParameterModel>;
  private requestBody: RequestBodyModel | null;
  private responses: ResponsesModel;
  private acceptHeader: ParameterModel;

  public requestResponse: RequestResponseModel | null = null;
  public loadingRequestResponse: boolean = false;

  //private externalDocs: OpenAPIExternalDocumentation | null;
  //private callbacks: { [callbackName: string]: Referenced<OpenAPICallback> };
  //private security: Array<{ [name: string]: string[] }>;

  constructor(path: string, method: string, operation: OpenAPIOperation) {
    this.id = this.generateId(path, method);
    this.path = path;
    this.method = method;

    this.tags = operation.tags || [];
    this.summary = operation.summary || "";
    this.description = operation.description || "";
    this.operationId = operation.operationId || null;
    this.deprecated = operation.deprecated || false;

    this.servers = this.processServers(operation?.servers || null);
    this.selectedServer = this.servers?.[0] || null;

    this.requestBody = operation.requestBody
      ? new RequestBodyModel(operation.requestBody)
      : null;

    this.responses = new ResponsesModel(operation.responses);
    this.parameters = this.processParameters(operation?.parameters || []);
    this.acceptHeader = this.parameters[0];

    makeObservable(this, {
      selectedServer: observable.ref,
      requestResponse: observable.ref,
      loadingRequestResponse: observable.ref,
      setRequestResponse: action,
      setLoadingRequestResponse: action,
      setSelectedServer: action,
    });

    //this.externalDocs = operation.externalDocs || null;
    //this.callbacks = operation.callbacks || {};
    //this.security = operation.security || [];
  }

  private generateId(path: string, method: string): string {
    return `${method}-${path}`;
  }

  private processServers(servers: OpenAPIServer[] | null) {
    if (!servers) return null;

    const generatedServers: Array<ServerModel> = [];

    for (const server of servers) {
      generatedServers.push(
        new ServerModel(server.url, server.description, server.variables)
      );
    }

    return generatedServers;
  }

  private processAcceptHeader(): ParameterModel {
    const accepted = this.responses.accepted;

    return new ParameterModel(this.id, {
      name: "Accept",
      in: "header",
      required: true,
      description: "Mandatory default header `Accept`",
      schema: {
        type: "string",
        enum: accepted,
      },
      example: accepted[0],
    });
  }

  private processContentType(): ParameterModel | null {
    const mimeTypes = this.requestBody?.getMimeTypes();

    if (!mimeTypes?.length) return null;

    return new ParameterModel(this.id, {
      name: "Content-Type",
      in: "header",
      required: this.requestBody?.required || false,
      description:
        "Default header `Content-Type`. If the body is required it is mandatory",
      schema: {
        type: "string",
        enum: mimeTypes,
      },
      example: mimeTypes[0],
    });
  }

  private processParameters(
    parameters: OpenAPIParameter[]
  ): Array<ParameterModel> {
    const parametersArray =
      parameters.map((param) => new ParameterModel(this.id, param)) || [];

    const acceptHeader =
      parametersArray.find(
        (p) => p.getIn() === "header" && p.name === "Accept"
      ) || this.processAcceptHeader();

    const contentType =
      parametersArray.find(
        (p) => p.getIn() === "header" && p.name.toLowerCase() === "content-type"
      ) || this.processContentType();

    if (contentType instanceof ParameterModel)
      return [acceptHeader, contentType, ...(parametersArray || [])];

    return [acceptHeader, ...(parametersArray || [])];
  }

  public getAcceptHeader(): ParameterModel {
    return this.acceptHeader;
  }

  public isInTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  public getRequestBody(): RequestBodyModel | null {
    return this.requestBody;
  }

  public getParameters(): Array<ParameterModel> {
    return this.parameters;
  }

  public getQueryParameters(): Array<ParameterModel> {
    return this.parameters.filter((p) => p.getIn() === "query");
  }

  public getPathParameters(): Array<ParameterModel> {
    return this.parameters.filter((p) => p.getIn() === "path");
  }

  public getHeaderParameters(): Array<ParameterModel> {
    return this.parameters.filter((p) => p.getIn() === "header");
  }

  public getCookieParameters(): Array<ParameterModel> {
    return this.parameters.filter((p) => p.getIn() === "cookie");
  }

  public getParameterDefaultValues(): {
    path: { [key: string]: { value: any; included: boolean } };
    query: { [key: string]: { value: any; included: boolean } };
    header: { [key: string]: { value: any; included: boolean } };
    cookie: { [key: string]: { value: any; included: boolean } };
  } {
    // Params to object
    const params = {
      path: {} as { [key: string]: { value: any; included: boolean } },
      query: {} as { [key: string]: { value: any; included: boolean } },
      header: {} as { [key: string]: { value: any; included: boolean } },
      cookie: {} as { [key: string]: { value: any; included: boolean } },
    };

    this.parameters.forEach((param) => {
      const paramIn = param.getIn();

      if (
        paramIn === "path" ||
        paramIn === "query" ||
        paramIn === "header" ||
        paramIn === "cookie"
      )
        params[paramIn][param.name] = {
          value: param.getExample(),
          included: param.deprecated ? false : true,
        };
    });

    return params;
  }

  public getAccept(): ParameterModel | undefined {
    return this.parameters.find(
      (p) => p.getIn() === "header" && p.name.toLowerCase() === "accept"
    );
  }

  public getContentType(): ParameterModel | undefined {
    return this.parameters.find(
      (p) => p.getIn() === "header" && p.name.toLowerCase() === "content-type"
    );
  }

  public getServers(): ServerModel[] | null {
    return this.servers;
  }

  public getSelectedServer(): ServerModel | null {
    return this.selectedServer;
  }

  public setSelectedServer(url: string): void {
    if (!this.servers) return;

    const server = this.servers.find((s) => s.getUrl() === url);

    if (server) this.selectedServer = server;
  }

  public getResponses(): ResponsesModel {
    return this.responses;
  }

  public setLoadingRequestResponse(loading: boolean) {
    this.loadingRequestResponse = loading;
  }

  public async setRequestResponse(requestResponse: {
    data: string;
    body: { [key: string]: any } | string;
    headers: { [key: string]: string | string[] };
    obj: { [key: string]: any } | string;
    ok: boolean;
    status: number;
    statusText: string;
    text: string;
    url: string;
    date: string;
  }) {
    this.requestResponse = new RequestResponseModel(
      requestResponse.data,
      requestResponse.body,
      requestResponse.headers,
      requestResponse.obj,
      requestResponse.ok,
      requestResponse.status,
      requestResponse.statusText,
      requestResponse.text,
      requestResponse.url,
      requestResponse.date
    );
  }
}
