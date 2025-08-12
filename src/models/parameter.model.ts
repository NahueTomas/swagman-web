import type {
  OpenAPIEncoding,
  OpenAPIExample,
  OpenAPIMediaType,
  OpenAPIParameter,
  OpenAPIParameterLocation,
  OpenAPIParameterStyle,
  OpenAPISchema,
} from "../shared/types/openapi";

import { getParameterDefaultValue } from "@/shared/utils/openapi";

export class ParameterModel {
  id: string;

  name: string;
  in?: OpenAPIParameterLocation;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  explode: boolean;
  style?: OpenAPIParameterStyle;
  allowReserved?: boolean;
  schema?: OpenAPISchema;
  example?: unknown;
  examples?: { [media: string]: OpenAPIExample };
  content?: { [media: string]: OpenAPIMediaType };
  encoding?: Record<string, OpenAPIEncoding>;
  const?: unknown;
  $ref?: string;

  constructor(operationId: string, parameter: OpenAPIParameter) {
    this.id = `${operationId}-${parameter.name}`;

    this.name = parameter.name;
    this.in = parameter.in;
    this.description = parameter.description;
    this.required = parameter.required;
    this.deprecated = parameter.deprecated;
    this.allowEmptyValue = parameter.allowEmptyValue;
    this.style = parameter.style;
    this.allowReserved = parameter.allowReserved;
    this.schema = parameter.schema;
    this.example = parameter.example;
    this.examples = parameter.examples;
    this.content = parameter.content;
    this.encoding = parameter.encoding;
    this.const = parameter.const;
    this.$ref = parameter.$ref;

    // Explode true by default in "query" and "cookie", false in "header" and "path"
    this.explode =
      (typeof parameter.explode === "boolean"
        ? parameter.explode
        : this.in === "query" || this.in === "cookie") || false;

    // Defining styles by default
    // For "query" & "cookie" is "form"
    // For "path" & "header" is "simple"
    this.style = parameter.style
      ? parameter.style
      : ["array", "object"].includes(this.getFirstType())
        ? this.in === "query" || this.in === "cookie"
          ? "form"
          : "simple"
        : undefined;
  }

  public getExample(): any {
    return getParameterDefaultValue(this);
  }

  public getType(): string | string[] {
    return this?.schema?.type || "any";
  }

  public getFirstType(): string {
    return Array.isArray(this.getType())
      ? (this.getType() as string[])?.[0]
      : (this.getType() as string);
  }

  public isRequired(): boolean {
    return this.required === true;
  }

  public getIn(): string {
    return this.in || "query";
  }
}
