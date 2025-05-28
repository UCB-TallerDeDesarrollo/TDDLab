import { Request } from "express";

export function createRequest(_id?: string | number, _body?: any) {
  return {
    params: { 
      id: _id !== undefined ? String(_id) : "",
      name: typeof _id === 'string' ? _id : ""
    },
    body: _body || {},
  } as unknown as Request;
}