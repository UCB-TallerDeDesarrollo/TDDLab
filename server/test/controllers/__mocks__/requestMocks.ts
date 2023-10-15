import { Request } from "express";
import { AssignmentDataObject } from "../../../src/modules/Assignments/domain/Assignment";

export function createRequest() {
  return {} as Request;
}

export function createRequestWithId(_id: string): Request {
  return {
    params: { id: _id },
  } as unknown as Request;
}

export function createRequestWithBody(_body: AssignmentDataObject): Request {
  return {
    body: _body,
  } as unknown as Request;
}

