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

  constructor(operationId: string, parameter: OpenAPIParameter) {
    this.id = `${operationId}-${parameter.name}`;

    this.name = parameter.name;
    this.in = parameter.in;
    this.description = parameter.description;
    this.required = parameter.required;
    this.deprecated = parameter.deprecated;
    this.allowEmptyValue = parameter.allowEmptyValue;
    this.style = parameter.style;
    this.explode = parameter.explode;
    this.allowReserved = parameter.allowReserved;
    this.schema = parameter.schema;
    this.example = parameter.example;
    this.examples = parameter.examples;
    this.content = parameter.content;
    this.encoding = parameter.encoding;
    this.const = parameter.const;
    this.$ref = parameter.$ref;
  }

  public getExample(): any {
    return getParameterDefaultValue(this);
  }

  public getType(): string | string[] {
    return this?.schema?.type || "any";
  }

  public isRequired(): boolean {
    return this.required === true;
  }

  public getIn(): string {
    return this.in || "query";
  }
}
