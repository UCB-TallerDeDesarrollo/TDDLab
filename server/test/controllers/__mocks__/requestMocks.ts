import { Request } from "express";
import { AssignmentDataObject } from "../../../src/modules/Assignments/domain/Assignment";

export function createRequest(_id?: string, _body?: AssignmentDataObject) {
  return {
    params: { id: _id || '' },
    body: _body || {},
  } as unknown as Request;
}

