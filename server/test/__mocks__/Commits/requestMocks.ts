import { Request } from "express";

export function createRequest(sha?: string, _body?: any, _link?: string) {
  return {
    params: { id: sha ?? "" },
    body: _body || { link: _link } || {},
  } as unknown as Request;
}
