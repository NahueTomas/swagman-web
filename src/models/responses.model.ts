import { OpenAPIResponses } from "../types/openapi";
import { getBodyExample } from "../utils/openapi";

export class ResponsesModel {
  public responses: OpenAPIResponses;
  public accepted: string[];

  constructor(responses: OpenAPIResponses) {
    this.responses = responses;
    this.accepted = this.processAccepted();
  }

  private processAccepted() {
    const accepted = new Set<string>();

    for (const [, value] of Object.entries(this.responses)) {
      if (value.content) {
        const mimeTypes = Object.keys(value.content);

        if (mimeTypes.length) {
          mimeTypes.forEach((type) => accepted.add(type));
        }
      }
    }

    if (accepted.size === 0) return ["*/*"];

    return Array.from(accepted);
  }

  public getResponse(code: string) {
    return this.responses[code];
  }

  public getResponseExample(code: string, accept: string): string | null {
    const responseSelected = this.getResponse(code);
    const example = getBodyExample(
      responseSelected?.content?.[accept]?.schema,
      accept.split("/")[1]
    );

    return typeof example === "string" ? example : "";
  }
}
