import { OpenAPISpec } from "../types/openapi";

export class SwaggerConverter {
  static async convert(specification: object): Promise<OpenAPISpec> {
    const converted = await fetch("https://converter.swagger.io/api/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/yaml",
      },
      body: JSON.stringify(specification),
    });

    return converted.json();
  }
}
