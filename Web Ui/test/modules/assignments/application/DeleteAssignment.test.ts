import { DeleteAssignment } from "../../../../src/modules/Assignments/application/DeleteAssignment";
//import { AssignmentDataObject } from "../../../../src/modules/Assignments/domain/assignmentInterfaces";
import { MockAssignmentsRepository } from "../../__mocks__/mockAssignmentsRepository";

let mockRepository: MockAssignmentsRepository;
let deleteAssignment: DeleteAssignment;
beforeEach(() => {
    mockRepository = new MockAssignmentsRepository();
    deleteAssignment = new DeleteAssignment(mockRepository);
});
describe('Test', () => {
    it('Should return true.', () => {
        expect(true).toBeTruthy;
    });
});
  