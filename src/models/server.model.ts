import { action, makeObservable, observable } from "mobx";

import { OpenAPIServerVariable } from "@/shared/types/openapi";

type Variable = OpenAPIServerVariable & { value: string };

export class ServerModel {
  public variables: {
    [key: string]: Variable;
  };

  constructor(
    private url: string,
    private description?: string,
    variables?: {
      [key: string]: OpenAPIServerVariable;
    }
  ) {
    if (variables) {
      const fVariables: {
        [key: string]: Variable;
      } = {};

      const nameVariables = Object.keys(variables);

      nameVariables.forEach((nV) => {
        const variable: Variable = {
          ...variables[nV],
          value: variables[nV].default || "",
        };

        fVariables[nV] = variable;
      });
      this.variables = fVariables;
    } else this.variables = {};

    makeObservable(this, {
      variables: observable,
      setVariableValue: action,
    });
  }

  public getUrl() {
    return this.url;
  }

  public getDescription() {
    return this.description;
  }

  public getVariables() {
    return this.variables;
  }

  public getVariableValue(key: string): string {
    return this.variables?.[key]?.value || "";
  }

  public setVariableValue(key: string, value: string): void {
    if (this.variables && this.variables[key]) {
      this.variables[key].value = value;
    }
  }

  public getUrlWithDefaultVariables() {
    if (!this.variables) return this.url;

    return Object.entries(this.variables).reduce((acc, [key, value]) => {
      return acc.replace(`{${key}}`, value.default);
    }, this.url);
  }

  public getUrlWithVariables() {
    if (!this.variables) return this.url;

    return Object.entries(this.variables).reduce((acc, [key]) => {
      return acc.replace(`{${key}}`, this.variables[key].value);
    }, this.url);
  }
}
