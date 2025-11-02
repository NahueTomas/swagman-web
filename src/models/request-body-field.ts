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

  constructor(
    name: string,
    required: boolean,
    schema: OpenAPISchema,
    defaultValue?: Value | Value[],
    defaultIncluded: boolean = true
  ) {
    this.name = name;
    this.required = required;
    this.schema = schema;

    // Reactive
    this.value = defaultValue || this.getExample() || undefined;
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
