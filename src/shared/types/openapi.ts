export interface OpenAPISpec {
  openapi: string;
  info: OpenAPIInfo;
  servers?: OpenAPIServer[];
  paths: OpenAPIPaths;
  components?: OpenAPIComponents;
  security?: OpenAPISecurityRequirement[];
  tags?: OpenAPITag[];
  externalDocs?: OpenAPIExternalDocumentation;
  webhooks?: OpenAPIPaths;
}

export interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
  summary?: string;
  termsOfService?: string;
  contact?: OpenAPIContact;
  license?: OpenAPILicense;
}

export interface OpenAPIServer {
  url: string;
  description?: string;
  variables?: { [name: string]: OpenAPIServerVariable };
}

export interface OpenAPIServerVariable {
  enum?: string[];
  default: string;
  description?: string;
}

export interface OpenAPIPaths {
  [path: string]: OpenAPIPath;
}

export interface OpenAPIPath {
  summary?: string;
  description?: string;
  get?: OpenAPIOperation;
  put?: OpenAPIOperation;
  post?: OpenAPIOperation;
  delete?: OpenAPIOperation;
  options?: OpenAPIOperation;
  head?: OpenAPIOperation;
  patch?: OpenAPIOperation;
  trace?: OpenAPIOperation;
  servers?: OpenAPIServer[];
  parameters?: OpenAPIParameter[];
  $ref?: string;
}

export interface OpenAPIOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: OpenAPIExternalDocumentation;
  operationId?: string;
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: OpenAPIResponses;
  callbacks?: { [name: string]: OpenAPICallback };
  deprecated?: boolean;
  security?: OpenAPISecurityRequirement[];
  servers?: OpenAPIServer[];
}

export interface OpenAPIParameter {
  name: string;
  in?: OpenAPIParameterLocation;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: OpenAPIParameterStyle;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: OpenAPISchema;
  example?: unknown;
  examples?: { [media: string]: OpenAPIExample };
  content?: { [media: string]: OpenAPIMediaType };
  encoding?: Record<string, OpenAPIEncoding>;
  const?: unknown;
  $ref?: string;
}

export interface OpenAPIExample {
  value: unknown;
  summary?: string;
  description?: string;
  externalValue?: string;
  $ref?: string;
}

export interface OpenAPISchema {
  $ref?: string;
  type?: string | string[];
  properties?: { [name: string]: OpenAPISchema };
  patternProperties?: { [name: string]: OpenAPISchema };
  additionalProperties?: boolean | OpenAPISchema;
  unevaluatedProperties?: boolean | OpenAPISchema;
  description?: string;
  default?: unknown;
  items?: OpenAPISchema | OpenAPISchema[] | boolean;
  required?: string[];
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;
  format?: string;
  externalDocs?: OpenAPIExternalDocumentation;
  discriminator?: OpenAPIDiscriminator;
  nullable?: boolean;
  oneOf?: OpenAPISchema[];
  anyOf?: OpenAPISchema[];
  allOf?: OpenAPISchema[];
  not?: OpenAPISchema;
  title?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean | number;
  minimum?: number;
  exclusiveMinimum?: boolean | number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  enum?: unknown[];
  example?: unknown;
  if?: OpenAPISchema;
  else?: OpenAPISchema;
  then?: OpenAPISchema;
  examples?: unknown[];
  const?: string;
  contentEncoding?: string;
  contentMediaType?: string;
  prefixItems?: OpenAPISchema[];
  additionalItems?: OpenAPISchema | boolean;
}

export interface OpenAPIMediaType {
  schema?: OpenAPISchema;
  example?: unknown;
  examples?: { [name: string]: OpenAPIExample };
  encoding?: { [field: string]: OpenAPIEncoding };
}

export interface OpenAPIEncoding {
  contentType: string;
  headers?: { [name: string]: OpenAPIHeader };
  style: OpenAPIParameterStyle;
  explode: boolean;
  allowReserved: boolean;
}

export type OpenAPIParameterLocation = "query" | "header" | "path" | "cookie";
export type OpenAPIParameterStyle =
  | "matrix"
  | "label"
  | "form"
  | "simple"
  | "spaceDelimited"
  | "pipeDelimited"
  | "deepObject";

export interface OpenAPIRequestBody {
  description?: string;
  required?: boolean;
  content: { [mime: string]: OpenAPIMediaType };
  $ref?: string;
}

export interface OpenAPIResponses {
  [code: string]: OpenAPIResponse;
}

export interface OpenAPIResponse {
  description?: string;
  headers?: { [name: string]: OpenAPIHeader };
  links?: { [name: string]: OpenAPILink };
  content?: { [mime: string]: OpenAPIMediaType };
  $ref?: string;
}

export type OpenAPIHeader = Omit<OpenAPIParameter, "in" | "name">;

export interface OpenAPICallback {
  [name: string]: OpenAPIPath | string | undefined;
  $ref?: string;
}

export interface OpenAPILink {
  $ref?: string;
}

export interface OpenAPIComponents {
  schemas?: { [name: string]: OpenAPISchema };
  responses?: { [name: string]: OpenAPIResponse };
  parameters?: { [name: string]: OpenAPIParameter };
  examples?: { [name: string]: OpenAPIExample };
  requestBodies?: { [name: string]: OpenAPIRequestBody };
  headers?: { [name: string]: OpenAPIHeader };
  securitySchemes?: { [name: string]: OpenAPISecurityScheme };
  links?: { [name: string]: OpenAPILink };
  callbacks?: { [name: string]: OpenAPICallback };
}

export interface OpenAPISecurityRequirement {
  [name: string]: string[];
}

export interface OpenAPISecurityScheme {
  type: "apiKey" | "http" | "mutualTLS" | "oauth2" | "openIdConnect";
  description?: string;
  name?: string;
  in?: "query" | "header" | "cookie";
  scheme?: string;
  bearerFormat?: string;
  flows?: {
    implicit?: {
      refreshUrl?: string;
      scopes: Record<string, string>;
      authorizationUrl: string;
    };
    password?: {
      refreshUrl?: string;
      scopes: Record<string, string>;
      tokenUrl: string;
    };
    clientCredentials?: {
      refreshUrl?: string;
      scopes: Record<string, string>;
      tokenUrl: string;
    };
    authorizationCode?: {
      refreshUrl?: string;
      scopes: Record<string, string>;
      tokenUrl: string;
    };
  };
  openIdConnectUrl?: string;
}

export interface OpenAPITag {
  name: string;
  description?: string;
  externalDocs?: OpenAPIExternalDocumentation;
}

export interface OpenAPIExternalDocumentation {
  description?: string;
  url: string;
}

export interface OpenAPIContact {
  name?: string;
  url?: string;
  email?: string;
}

export interface OpenAPILicense {
  name: string;
  url?: string;
  identifier?: string;
}

export interface OpenAPIDiscriminator {
  propertyName: string;
  mapping?: Record<string, string>;
}
