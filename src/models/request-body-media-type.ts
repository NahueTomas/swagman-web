import type { OpenAPIMediaType } from "@/shared/types/openapi";

import { action, makeObservable, observable } from "mobx";

import { getBodyExample } from "@/shared/utils/openapi";
import { RequestBodyField } from "@/models/request-body-field";

const FORM_MEDIA_TYPES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "application/octet-stream",
];

export class RequestBodyMediaType {
  public name: string;
  public mediaType: OpenAPIMediaType;

  // Only with "text"
  public value: string | undefined = undefined;

  // Only with "form"
  public fields: RequestBodyField[] | undefined;

  private mediaTypeFormat: string;

  constructor(name: string, mediaType: OpenAPIMediaType) {
    this.name = name;
    this.mediaType = mediaType;

    this.mediaTypeFormat = this.processMediaTypeFormat();

    if (this.mediaTypeFormat === "form") {
      this.fields = this.processFields();
    } else {
      // si es "text", usamos un único observable
      this.value =
        getBodyExample(
          this.mediaType.schema,
          this.name.split("/")?.[1] || undefined
        ) || "";

      makeObservable(this, {
        value: observable,
        setValue: action,
      });
    }
  }

  private processMediaTypeFormat(): "form" | "text" {
    // schema.format = binary → field file
    if (this.mediaType.schema?.format === "binary") return "form";
    if (FORM_MEDIA_TYPES.includes(this.name)) return "form";

    return "text";
  }

  private processFields() {
    const fields: RequestBodyField[] = [];
    const properties = this.mediaType?.schema?.properties;

    if (!properties && this.mediaType?.schema?.format === "binary")
      return [
        new RequestBodyField(
          "file",
          this.mediaType?.schema?.required?.includes("file") || false,
          this.mediaType.schema
        ),
      ];

    if (!properties) return fields;

    for (const property in properties) {
      const prop = properties[property];

      fields.push(
        new RequestBodyField(
          property,
          this.mediaType?.schema?.required?.includes(property) || false,
          prop
        )
      );
    }

    return fields;
  }

  public getMediaTypeFormat() {
    return this.mediaTypeFormat;
  }

  public getFullExample(): string {
    return getBodyExample(
      this.mediaType.schema,
      this.name.split("/")?.[1] || undefined
    );
  }

  // Only with "text"
  public setValue(newValue: string) {
    if (this.getMediaTypeFormat() === "text") this.value = newValue;
  }
}
