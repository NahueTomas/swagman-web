import { OpenAPIServerVariable } from "@/types/openapi";

export class ServerModel {
  constructor(
    private url: string,
    private description?: string,
    private variables?: { [key: string]: OpenAPIServerVariable }
  ) {
    this.url = url;
    this.description = description;
    this.variables = variables;
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

  public getVariable(key: string) {
    return this.variables?.[key];
  }

  public getUrlWithDefaultVariables() {
    if (!this.variables) return this.url;

    return Object.entries(this.variables).reduce((acc, [key, value]) => {
      return acc.replace(`{${key}}`, value.default);
    }, this.url);
  }

  public getUrlWithVariables(variables: { [key: string]: string }) {
    if (!this.variables) return this.url;

    return Object.entries(this.variables).reduce((acc, [key]) => {
      return acc.replace(`{${key}}`, variables[key]);
    }, this.url);
  }
}
