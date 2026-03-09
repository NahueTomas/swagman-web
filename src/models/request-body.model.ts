import type {
  OpenAPIRequestBody,
  OpenAPIMediaType,
} from "../shared/types/openapi";
import type { OperationCache } from "@/hooks/use-cache-store";
import type { Value } from "@/shared/types/parameter-value";

import { RequestBodyMediaType } from "./request-body-media-type";

export class RequestBodyModel {
  description: string;
  required: boolean;
  content: { [mime: string]: OpenAPIMediaType };

  mediaTypes: RequestBodyMediaType[];

  constructor(
    requestBody: OpenAPIRequestBody,
    operationId?: string,
    cachedBody?: OperationCache["body"]
  ) {
    this.description = requestBody.description || "";
    this.required = requestBody.required || false;
    this.content = requestBody.content || {};

    const mediaTypes = Object.keys(this.content);

    this.mediaTypes = mediaTypes.map((mime) => {
      return new RequestBodyMediaType(
        mime,
        this.content[mime],
        operationId,
        cachedBody?.[mime]
      );
    });
  }

  public getMimeTypes(): string[] {
    return this.mediaTypes.map((mediaType) => mediaType.name);
  }

  public getMimeType(mime: string): RequestBodyMediaType | undefined {
    return this.mediaTypes.find((mediaType) => mediaType.name === mime);
  }

  public getFieldDefaultValues(): Record<
    string,
    Record<string, { value: Value | Value[]; included: boolean }> | string
  > {
    const mimeTypes = this.getMimeTypes();
    const mimeTypesAndObjects = mimeTypes.reduce<
      Record<
        string,
        Record<string, { value: Value | Value[]; included: boolean }> | string
      >
    >((acc, mimeType) => {
      const bodyMediaType = this.getMimeType(mimeType);

      if (bodyMediaType?.getMediaTypeFormat() === "text") {
        acc[mimeType] = bodyMediaType.getFullExample() || "";

        return acc;
      } else {
        const bodyMediaTypeParams: Record<
          string,
          { value: Value | Value[]; included: boolean }
        > = {};

        bodyMediaType?.fields &&
          bodyMediaType?.fields.forEach((field) => {
            const example = field.getExample();

            bodyMediaTypeParams[field.name] = {
              value:
                example !== null && typeof example !== "boolean"
                  ? (example ?? undefined)
                  : undefined,
              included: true,
            };
          });
        acc[mimeType] = bodyMediaTypeParams;

        return acc;
      }
    }, {});

    return mimeTypesAndObjects;
  }
}
