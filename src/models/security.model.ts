import { action, makeObservable, observable } from "mobx";

import { OpenAPISecurityScheme } from "@/shared/types/openapi";

export class SecurityModel {
  public logged: boolean = false;

  constructor(
    private key: string,
    private securitySchema: OpenAPISecurityScheme,
    public credentials: SecurityCredentials = undefined
  ) {
    makeObservable(this, {
      credentials: observable.ref,
      logged: observable,
      setCredentials: action,
    });
  }

  public setCredentials(credentials: SecurityCredentials) {
    this.credentials = credentials;
    this.logged = credentials !== undefined;
  }

  public getKey() {
    return this.key;
  }

  public getIn() {
    return this.securitySchema.in;
  }

  public getDescription() {
    return this.securitySchema.description;
  }

  public getSecuritySchema(): OpenAPISecurityScheme {
    return this.securitySchema;
  }

  public getScheme() {
    return this.securitySchema.scheme;
  }

  public getType() {
    return this.securitySchema.type;
  }
}

export type SecurityCredentials =
  | undefined
  | { type: "apiKey"; value: string }
  | { type: "http"; scheme: "bearer"; token: string }
  | { type: "http"; scheme: "basic"; username: string; password: string }
  | {
      type: "oauth2";
      access_token: string;
      refresh_token?: string;
      scope: string[];
      expires_at?: number;
    }
  | {
      type: "openIdConnect";
      id_token: string;
      access_token?: string;
      refresh_token?: string;
      scope: string[];
    };
