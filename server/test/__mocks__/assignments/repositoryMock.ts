import {
  AssignmentInProgresDataMock,
  assignmentPendingDataMock,
} from "./dataTypeMocks/assignmentData";

export function getAssignmentRepositoryMock() {
  return {
    createAssignment: jest.fn(),
    executeQuery: jest.fn(),
    mapRowToAssignment: jest.fn(),
    obtainAssignments: jest.fn(),
    obtainAssignmentById: jest.fn(async (id) => {
      switch (id) {
        case "id_assignment_pending":
          return assignmentPendingDataMock;
        case "id_assignment_in_progress":
          return AssignmentInProgresDataMock;
        case "non_existing_id":
          return null;
        default:
          return null;
      }
    }),
    obtainAssignmentsByGroupId: jest.fn(),
    deleteAssignment: jest.fn(),
    updateAssignment: jest.fn(),
    deliverAssignment: jest.fn(),
    groupidExistsForAssigment: jest.fn(),
    checkDuplicateTitle: jest.fn().mockReturnValue(false),
    executeTransaction: jest.fn(),
    obtainAssignmentsByPracticeId: jest.fn(),
    deleteAssignmentsByPracticeId: jest.fn(),
    getAssignmentByIdUseCase:jest.fn(),
    deleteAssignmentUseCase:jest.fn(),
  };
}
