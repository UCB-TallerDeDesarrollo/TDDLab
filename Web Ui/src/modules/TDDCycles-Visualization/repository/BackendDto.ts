export type BackendErrorResponse = {
  code: string;
  detail: string;
}

export class BackendApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);

    this.name = "BackendApiError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
