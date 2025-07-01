import type {
  OpenAPIRequestBody,
  OpenAPIMediaType,
} from "../shared/types/openapi";

import { RequestBodyMediaType } from "./request-body-media-type";

export class RequestBodyModel {
  description: string;
  required: boolean;
  content: { [mime: string]: OpenAPIMediaType };

  mediaTypes: RequestBodyMediaType[];

  constructor(requestBody: OpenAPIRequestBody) {
    this.description = requestBody.description || "";
    this.required = requestBody.required || false;
    this.content = requestBody.content || {};

    const mediaTypes = Object.keys(this.content);

    this.mediaTypes = mediaTypes.map((mime) => {
      return new RequestBodyMediaType(mime, this.content[mime]);
    });
  }

  public getMimeTypes(): string[] {
    return this.mediaTypes.map((mediaType) => mediaType.name);
  }

  public getMimeType(mime: string): RequestBodyMediaType | undefined {
    return this.mediaTypes.find((mediaType) => mediaType.name === mime);
  }

  public getFieldDefaultValues(): {
    [mime: string]:
      | { [key: string]: { value: any; included: boolean } }
      | string;
  } {
    const mimeTypes = this.getMimeTypes();
    const mimeTypesAndObjects = mimeTypes.reduce<{
      [mime: string]:
        | { [key: string]: { value: any; included: boolean } }
        | string;
    }>((acc, mimeType) => {
      const bodyMediaType = this.getMimeType(mimeType);

      if (bodyMediaType?.getMediaTypeFormat() === "text") {
        acc[mimeType] = bodyMediaType.getFullExample() || "";

        return acc;
      } else {
        const bodyMediaTypeParams: {
          [key: string]: { value: any; included: boolean };
        } = {};

        bodyMediaType?.getFields().forEach((field) => {
          bodyMediaTypeParams[field.name] = {
            value: field.getExample(),
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
