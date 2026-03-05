import { action, makeObservable, observable } from "mobx";

import { getParameterDefaultValue } from "@/shared/utils/openapi";
import { OpenAPISchema } from "@/shared/types/openapi";
import { Value } from "@/shared/types/parameter-value";

export class RequestBodyField {
  public name: string;
  public required: boolean;
  public schema: OpenAPISchema;
  public value: Value | Value[];
  public included: boolean;
  /** Parent operation ID — used by components when writing to the cache. */
  public operationId: string;
  /** Parent mime type — used by components when writing to the cache. */
  public mimeType: string;

  constructor(
    name: string,
    required: boolean,
    schema: OpenAPISchema,
    operationId: string = "",
    mimeType: string = "",
    defaultValue?: Value | Value[],
    defaultIncluded?: boolean
  ) {
    this.name = name;
    this.required = required;
    this.schema = schema;
    this.operationId = operationId;
    this.mimeType = mimeType;

    // Cached value takes priority; fall back to schema example
    const example = this.getExample();

    this.value =
      defaultValue !== undefined
        ? defaultValue
        : example !== null && typeof example !== "boolean"
          ? (example ?? undefined)
          : undefined;
    this.included = defaultIncluded !== undefined ? defaultIncluded : true;

    makeObservable(this, {
      value: observable.ref,
      included: observable,
      setValue: action,
      setIncluded: action,
    });
  }

  public getExample() {
    return getParameterDefaultValue({
      name: this.name,
      schema: this.schema,
    });
  }

  public setValue(value: Value | Value[]) {
    this.value = value;
  }

  public setIncluded(included: boolean) {
    this.included = included;
  }
}
