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

export class EmptyDataError extends BackendApiError {
  constructor(resource: string) {
    super(`No hay datos disponibles para: ${resource}.`, "EMPTY_DATA");
    this.name = "EmptyDataError";
  }
}