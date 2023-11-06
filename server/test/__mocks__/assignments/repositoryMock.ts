import { getAssignmentMock } from "./dataTypeMocks/assignmentData";

export function getAssignmentRepositoryMock() {
  return {
    createAssignment: jest.fn(),
    executeQuery: jest.fn(),
    mapRowToAssignment: jest.fn(),
    obtainAssignments: jest.fn(),
    obtainAssignmentById: jest.fn(async (id) => {
      switch (id) {
        case "existing_id":
          return getAssignmentMock();
          case "non_existing_id":
          return null;
        default:
          throw new Error("Assignment not found");
      }
    }),
    deleteAssignment: jest.fn(),
    updateAssignment: jest.fn(),
    deliverAssignment: jest.fn(),
  };
}
