import type {
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPIServer,
  OpenAPISecurityRequirement,
} from "../shared/types/openapi";
import type { OperationCache } from "@/hooks/use-cache-store";
import type { Value } from "@/shared/types/parameter-value";

import { action, makeObservable, observable } from "mobx";

import { ParameterModel } from "./parameter.model";
import { RequestBodyModel } from "./request-body.model";
import { ResponsesModel } from "./responses.model";
import { ServerModel } from "./server.model";
import { RequestResponseModel } from "./request-response.model";
import { SecurityModel } from "./security.model";

export class OperationModel {
  /** Derive the stable operation ID from path + method without constructing the model. */
  public static buildId(path: string, method: string): string {
    return `${method}-${path}`;
  }

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
  public security: Array<OpenAPISecurityRequirement>;

  public requestResponse: RequestResponseModel | null = null;
  public loadingRequestResponse: boolean = false;
  public requestError: string | null = null;

  //private externalDocs: OpenAPIExternalDocumentation | null;
  //private callbacks: { [callbackName: string]: Referenced<OpenAPICallback> };

  constructor(
    path: string,
    method: string,
    operation: OpenAPIOperation,
    cachedValues?: OperationCache
  ) {
    this.id = OperationModel.buildId(path, method);
    this.path = path;
    this.method = method;

    this.tags = operation.tags || [];
    this.summary = operation.summary || "";
    this.description = operation.description || "";
    this.operationId = operation.operationId || null;
    this.deprecated = operation.deprecated || false;

    this.servers = this.processServers(operation?.servers || null);
    this.selectedServer = this.servers?.[0] || null;

    // Restore persisted operation-level server if one was saved
    if (cachedValues?.server && this.servers) {
      const cached = this.servers.find(
        (s) => s.getUrl() === cachedValues.server
      );

      if (cached) this.selectedServer = cached;
    }

    this.requestBody = operation.requestBody
      ? new RequestBodyModel(operation.requestBody, this.id, cachedValues?.body)
      : null;

    this.responses = new ResponsesModel(operation.responses);
    this.parameters = this.processParameters(
      operation?.parameters || [],
      cachedValues?.params
    );
    this.acceptHeader = this.parameters[0];
    this.security = operation.security || [];

    makeObservable(this, {
      selectedServer: observable.ref,
      requestResponse: observable.ref,
      loadingRequestResponse: observable.ref,
      requestError: observable.ref,
      security: observable.ref,
      setRequestResponse: action,
      setLoadingRequestResponse: action,
      setRequestError: action,
      setSelectedServer: action,
    });
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

  private processAcceptHeaderWithCache(
    cachedParams?: OperationCache["params"]
  ): ParameterModel {
    const accepted = this.responses.accepted;
    const cached = cachedParams?.["header.Accept"];

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
      ...(cached !== undefined
        ? { defaultValue: cached.value, defaultIncluded: cached.included }
        : {}),
    });
  }

  private processContentTypeWithCache(
    cachedParams?: OperationCache["params"]
  ): ParameterModel | null {
    const mimeTypes = this.requestBody?.getMimeTypes();

    if (!mimeTypes?.length) return null;

    const cached = cachedParams?.["header.Content-Type"];

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
      ...(cached !== undefined
        ? { defaultValue: cached.value, defaultIncluded: cached.included }
        : {}),
    });
  }

  private processParameters(
    parameters: OpenAPIParameter[],
    cachedParams?: OperationCache["params"]
  ): Array<ParameterModel> {
    const makeParam = (param: OpenAPIParameter) => {
      const cacheKey = `${param.in || "query"}.${param.name}`;
      const cached = cachedParams?.[cacheKey];

      return new ParameterModel(this.id, {
        ...param,
        ...(cached !== undefined
          ? { defaultValue: cached.value, defaultIncluded: cached.included }
          : {}),
      });
    };

    const parametersArray = parameters.map(makeParam);

    const acceptHeader =
      parametersArray.find(
        (p) => p.getIn() === "header" && p.name === "Accept"
      ) || this.processAcceptHeaderWithCache(cachedParams);

    const contentType =
      parametersArray.find(
        (p) => p.getIn() === "header" && p.name.toLowerCase() === "content-type"
      ) || this.processContentTypeWithCache(cachedParams);

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
    path: Record<string, { value: Value | Value[]; included: boolean }>;
    query: Record<string, { value: Value | Value[]; included: boolean }>;
    header: Record<string, { value: Value | Value[]; included: boolean }>;
    cookie: Record<string, { value: Value | Value[]; included: boolean }>;
  } {
    const params = {
      path: {} as Record<string, { value: Value | Value[]; included: boolean }>,
      query: {} as Record<
        string,
        { value: Value | Value[]; included: boolean }
      >,
      header: {} as Record<
        string,
        { value: Value | Value[]; included: boolean }
      >,
      cookie: {} as Record<
        string,
        { value: Value | Value[]; included: boolean }
      >,
    };

    this.parameters.forEach((param) => {
      const paramIn = param.getIn();

      if (
        paramIn === "path" ||
        paramIn === "query" ||
        paramIn === "header" ||
        paramIn === "cookie"
      ) {
        const example = param.getExample();

        params[paramIn][param.name] = {
          value:
            example !== null && typeof example !== "boolean"
              ? (example ?? undefined)
              : undefined,
          included: param.deprecated ? false : true,
        };
      }
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

  public isSecuritySatisfied(globalSecurity: SecurityModel[]): boolean {
    // If no security schemes defined at all, no security needed
    if (!this.security.length) return false;

    // Check if ANY security requirement is satisfied (OR logic)
    return this.security.some((requirement) => {
      const schemeNames = Object.keys(requirement);

      // All schemes in this requirement must be logged in global security (AND logic)
      return schemeNames.every((schemeName) => {
        const securityModel = globalSecurity.find(
          (s) => s.getKey() === schemeName
        );

        return securityModel?.logged || false;
      });
    });
  }

  public getResponses(): ResponsesModel {
    return this.responses;
  }

  public setLoadingRequestResponse(loading: boolean) {
    this.loadingRequestResponse = loading;
  }

  public setRequestError(error: string | null) {
    this.requestError = error;
  }

  public async setRequestResponse(requestResponse: {
    data: string;
    body: Record<string, unknown> | string;
    headers: Record<string, string | string[]>;
    obj: Record<string, unknown> | string;
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
