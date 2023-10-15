import { Request } from "express";

export function createRequest() {
  return {} as Request;
}

export function createRequestWithId(_id: string): Request {
  return {
    params: { id: _id },
  } as unknown as Request;
}

