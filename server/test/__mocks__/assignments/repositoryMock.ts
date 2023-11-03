import { AssignmentDataObject } from "../../../src/modules/Assignments/domain/Assignment";

interface DatabaseMock {
  executeQuery: jest.Mock<any, any, any>;
  mapAssignment: jest.Mock<any, any, any>;
}

export function getAssignmentRepositoryMock() {
  return {
    createAssignment: jest.fn(),
    obtainAssignments: jest.fn(),
    obtainAssignmentById: jest.fn(async (id) => {
      if (id === "existing_id") {
        return getAssignmentMock();
      }
      if (id !== "existing_id") {
        return null;
      }
      throw new Error("Assignment not found aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    }),
    deleteAssignment: jest.fn(),
    updateAssignment: jest.fn(),
    deliverAssignment: jest.fn(),
  };
}
