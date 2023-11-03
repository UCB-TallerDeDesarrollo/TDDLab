import { getAssignmentMock } from "./dataTypeMocks/assignmentData";

export function getAssignmentRepositoryMock(){
    return {
        createAssignment: jest.fn(),
        obtainAssignments: jest.fn(),
        obtainAssignmentById: jest.fn(async (id) =>{
            if (id === 'existing_id') {
                return getAssignmentMock();
            } 
            if (id !== 'existing_id') {
                return null;
            }
            throw new Error('Assignment not found aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
        }),
        deleteAssignment: jest.fn(),
        updateAssignment: jest.fn(),
        deliverAssignment: jest.fn(),
    };
} 