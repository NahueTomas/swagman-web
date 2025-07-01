import { getParameterDefaultValue } from "@/shared/utils/openapi";
import { OpenAPISchema } from "@/shared/types/openapi";

export class RequestBodyField {
  public name: string;
  public required: boolean;
  public schema: OpenAPISchema;

  constructor(name: string, required: boolean, schema: OpenAPISchema) {
    this.name = name;
    this.required = required;
    this.schema = schema;
  }

  public getExample() {
    return getParameterDefaultValue({
      name: this.name,
      schema: this.schema,
    });
  }
}
