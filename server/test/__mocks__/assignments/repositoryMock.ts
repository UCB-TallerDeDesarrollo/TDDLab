export function getAssignmentRepositoryMock(){
    return {
        createAssignment: jest.fn(),
        obtainAssignments: jest.fn(),
        obtainAssignmentById: jest.fn(),
        deleteAssignment: jest.fn(),
        updateAssignment: jest.fn(),
    };
}
  