// TODO: Redoc file

import { sample } from "openapi-sampler";

import { OpenAPIParameter, OpenAPISchema } from "../types/openapi";

import { isArray, isBoolean } from "./helpers";

export function isJsonLike(contentType: string): boolean {
  return contentType.search(/json/i) !== -1;
}

export function isFormUrlEncoded(contentType: string): boolean {
  return contentType === "application/x-www-form-urlencoded";
}

const SCHEMA_KEYWORD_TYPES = {
  multipleOf: "number",
  maximum: "number",
  exclusiveMaximum: "number",
  minimum: "number",
  exclusiveMinimum: "number",

  maxLength: "string",
  minLength: "string",
  pattern: "string",
  contentEncoding: "string",
  contentMediaType: "string",

  items: "array",
  maxItems: "array",
  minItems: "array",
  uniqueItems: "array",

  maxProperties: "object",
  minProperties: "object",
  required: "object",
  additionalProperties: "object",
  unevaluatedProperties: "object",
  properties: "object",
  patternProperties: "object",
};

export function detectType(schema: OpenAPISchema): string {
  if (schema.type !== undefined && !isArray(schema.type)) {
    return schema.type;
  }
  const keywords = Object.keys(SCHEMA_KEYWORD_TYPES);

  for (const keyword of keywords) {
    const type =
      SCHEMA_KEYWORD_TYPES[keyword as keyof typeof SCHEMA_KEYWORD_TYPES];

    if (schema[keyword as keyof OpenAPISchema] !== undefined) return type;
  }

  return "any";
}

export function isPrimitiveType(
  schema: OpenAPISchema,
  type: string | string[] | undefined = schema.type
): boolean {
  if (schema.oneOf !== undefined || schema.anyOf !== undefined) return false;
  if ((schema.if && schema.then) || (schema.if && schema.else)) return false;

  let isPrimitive = true;
  const isArrayType = isArray(type);

  if (type === "object" || (isArrayType && type?.includes("object"))) {
    isPrimitive =
      schema.properties !== undefined
        ? Object.keys(schema.properties).length === 0
        : schema.additionalProperties === undefined &&
          schema.unevaluatedProperties === undefined &&
          schema.patternProperties === undefined;
  }

  if (isArray(schema.items) || isArray(schema.prefixItems)) return false;

  if (
    schema.items !== undefined &&
    !isBoolean(schema.items) &&
    (type === "array" || (isArrayType && type?.includes("array")))
  )
    isPrimitive = isPrimitiveType(schema.items, schema.items.type);

  return isPrimitive;
}

export function getParameterDefaultValue(
  parameter: OpenAPIParameter,
  primitiveDefault: boolean = true
): any {
  const schema = parameter.schema;

  if (!schema) return undefined;

  // Return null if no default value is found
  const nullable = schema.nullable === true;

  // Example and default properties
  if (schema.example !== undefined) return schema.example;
  if (parameter.example !== undefined) return parameter.example;
  if (schema.default !== undefined) return schema.default;
  if (schema.enum?.length) return schema.enum[0];

  // Combinations: allOf
  if (schema.allOf && Array.isArray(schema.allOf)) {
    // Merge properties from all schemas
    return schema.allOf.reduce((acc: Record<string, unknown>, subschema) => {
      const fakeItem = { schema: subschema } as OpenAPIParameter;
      const subDefault = getParameterDefaultValue(fakeItem, primitiveDefault);

      return {
        ...acc,
        ...(typeof subDefault === "object" ? subDefault : {}),
      };
    }, {});
  }

  // Combinations: oneOf
  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    // Return the first defined value
    for (const subschema of schema.oneOf) {
      const fakeItem = { schema: subschema } as OpenAPIParameter;
      const subDefault = getParameterDefaultValue(fakeItem, primitiveDefault);

      if (subDefault !== undefined) return subDefault;
    }
  }

  // Combinations: AnyOf
  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    // Similar to oneOf: use the first defined value
    for (const subschema of schema.anyOf) {
      const fakeItem = { schema: subschema } as OpenAPIParameter;
      const subDefault = getParameterDefaultValue(fakeItem, primitiveDefault);

      if (subDefault !== undefined) return subDefault;
    }
  }

  // Objects
  if (schema.type === "object") {
    if (schema.properties) {
      const result: Record<string, unknown> = {};

      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const fakeItem = { schema: propSchema } as OpenAPIParameter;

        result[key] = getParameterDefaultValue(fakeItem, primitiveDefault);
      }

      return result;
    }

    return {};
  }

  // Arrays
  if (schema.type === "array") {
    if (schema.items) {
      const fakeItem = {
        schema: schema.items,
        name: `${parameter.name}-items`,
      } as OpenAPIParameter;
      const defaultValue = getParameterDefaultValue(fakeItem, primitiveDefault);

      if (defaultValue === null) return [];

      return [defaultValue];
    }

    return [];
  }

  // Default values based on primitive types
  if (primitiveDefault) {
    switch (schema.type) {
      case "string":
        return "string";
      case "number":
      case "integer":
        return 0;
      case "boolean":
        return false;
      default:
        break;
    }

    return nullable ? null : undefined;
  }

  return undefined;
}

export function getBodyExample(schema: any, format: string | undefined) {
  try {
    if (format === "text")
      return JSON.stringify(getParameterDefaultValue({ name: "text", schema }));

    const result = sample(schema, {
      format: format as "json" | "xml" | undefined,
    });

    return typeof result === "string"
      ? result
      : JSON.stringify(result, null, 2);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return "";
  }
}
