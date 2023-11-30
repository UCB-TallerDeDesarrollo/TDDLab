import { Request } from "express";

export function createRequest(_id?: string, _body?: any, _link?: string) {
  return {
    params: { id: _id ?? "" },
    body: _body || {},
  } as unknown as Request;
}
