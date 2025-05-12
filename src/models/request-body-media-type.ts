import type { OpenAPIMediaType } from '../types/openapi';
import { getBodyExample } from '../utils/openapi';
import { RequestBodyField } from './request-body-field';

const FORM_MEDIA_TYPES = [
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'application/octet-stream',
];

export class RequestBodyMediaType {
  public name: string;
  public mediaType: OpenAPIMediaType;
  private mediaTypeFormat: string;
  private fields: RequestBodyField[];

  constructor(name: string, mediaType: OpenAPIMediaType) {
    this.name = name;
    this.mediaType = mediaType;

    this.mediaTypeFormat = this.processMediaTypeFormat();
    this.fields = this.processFields();
  }

  private processMediaTypeFormat(): 'form' | 'text' {
    // schema.format = binary → field file
    if (this.mediaType.schema?.format === 'binary') return 'form';
    if (FORM_MEDIA_TYPES.includes(this.name)) return 'form';
    return 'text';
  }

  private processFields() {
    const fields: RequestBodyField[] = [];
    const properties = this.mediaType?.schema?.properties;

    if (!properties && this.mediaType?.schema?.format === 'binary')
      return [
        new RequestBodyField(
          'file',
          this.mediaType?.schema?.required?.includes('file') || false,
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

  public getFullExample() {
    return getBodyExample(
      this.mediaType.schema,
      this.name.split('/')?.[1] || undefined
    );
  }

  public getFields() {
    return this.fields;
  }
}
