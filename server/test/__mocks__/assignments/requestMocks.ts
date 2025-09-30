import { Request } from "express";

export function createRequest(_id?: string, _body?: any, _link?: string) {
  return {
    params: { id: _id ?? "" },
    body: _body || { link: _link } || {},
  } as unknown as Request;
}

export function createRequestNumericId(_id?: number, _body?: any, _link?: string) {
  return {
    params: { id: _id ?? 0 },
    body: _body || { link: _link } || {},
  } as unknown as Request;
}
