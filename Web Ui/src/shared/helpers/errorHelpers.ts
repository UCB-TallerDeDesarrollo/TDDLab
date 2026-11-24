/** Lee `message` de un error sin asumir que es una instancia de Error. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  return String(error);
}

/** Lee `response.status` de errores de red sin asumir su forma exacta. */
export function getErrorResponseStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }

  const response = (error as { response?: { status?: unknown } }).response;
  return response && typeof response.status === "number"
    ? response.status
    : undefined;
}

/** Lee `response.data.error`, habitual en respuestas del backend. */
export function getErrorResponseMessage(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }

  const response = (error as { response?: { data?: { error?: unknown } } })
    .response;
  const message = response?.data?.error;
  return typeof message === "string" ? message : undefined;
}
