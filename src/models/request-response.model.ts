export class RequestResponseModel {
  constructor(
    private data: string,
    private body: Record<string, unknown> | string,
    private headers: Record<string, string | string[]>,
    private obj: Record<string, unknown> | string,
    private ok: boolean,
    private status: number,
    private statusText: string,
    private text: string,
    private url: string,
    private date: string
  ) {}

  public getData() {
    return this.body || this.obj || this.data || this.text;
  }

  public getUrl() {
    return this.url;
  }

  public getDate() {
    return this.date;
  }

  public getStatus() {
    return this.status;
  }

  public getStatusText() {
    return this.statusText;
  }

  public getOK() {
    return this.ok;
  }

  public getHeaders() {
    return this.headers;
  }
}
