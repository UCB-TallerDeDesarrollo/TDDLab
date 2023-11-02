import { Request } from "express";
// import { AssignmentDataObject } from "../../../src/modules/Assignments/domain/Assignment";

export function createRequest(_id?: string, _body?: any, _link?: string) {
  return {
    params: { id: _id || '' },
    body: _body || { link: _link } || {},
  } as unknown as Request;
}