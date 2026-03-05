import type { OpenAPIMediaType } from "@/shared/types/openapi";
import type { BodyEntry } from "@/hooks/use-cache-store";

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
  /** The parent operation's ID — used by components when writing to the cache. */
  public operationId: string;

  // Only with "text"
  public value: string | undefined = undefined;

  // Only with "form"
  public fields: RequestBodyField[] | undefined;

  private mediaTypeFormat: string;

  constructor(
    name: string,
    mediaType: OpenAPIMediaType,
    operationId?: string,
    cachedEntry?: BodyEntry
  ) {
    this.name = name;
    this.mediaType = mediaType;
    this.operationId = operationId ?? "";

    this.mediaTypeFormat = this.processMediaTypeFormat();

    if (this.mediaTypeFormat === "form") {
      this.fields = this.processFields(cachedEntry);
    } else {
      // For text format: use cached value if available, otherwise schema example
      const schemaExample =
        getBodyExample(
          this.mediaType.schema,
          this.name.split("/")?.[1] || undefined
        ) || "";

      this.value =
        cachedEntry?.format === "text" ? cachedEntry.value : schemaExample;

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

  private processFields(cachedEntry?: BodyEntry) {
    const cachedFields =
      cachedEntry?.format === "form" ? cachedEntry.fields : undefined;

    const fields: RequestBodyField[] = [];
    const properties = this.mediaType?.schema?.properties;

    if (!properties && this.mediaType?.schema?.format === "binary")
      return [
        new RequestBodyField(
          "file",
          this.mediaType?.schema?.required?.includes("file") || false,
          this.mediaType.schema,
          this.operationId,
          this.name
        ),
      ];

    if (!properties) return fields;

    for (const property in properties) {
      const prop = properties[property];
      const cachedField = cachedFields?.[property];

      fields.push(
        new RequestBodyField(
          property,
          this.mediaType?.schema?.required?.includes(property) || false,
          prop,
          this.operationId,
          this.name,
          cachedField?.value,
          cachedField?.included
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
