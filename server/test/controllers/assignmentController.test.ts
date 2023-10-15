import AssignmentsController from "../../src/controllers/assignments/assignmentController";
import GetAssignments from "../../src/modules/Assignments/application/AssignmentUseCases/getAssignmentsUseCase";
import AssignmentRepository from "../../src/modules/Assignments/repositories/AssignmentRepository";

import {assignmentList} from "./__mocks__/dataTypeMocks/assignmentListData"
import { createRequest } from "./__mocks__/requestMocks";
import { createResponse } from "./__mocks__/responseMoks";

let controller: AssignmentsController;
let repository: AssignmentRepository;

beforeEach(() => {
  repository = new AssignmentRepository();
  controller = new AssignmentsController(repository);
});

describe('Get assignments', () => {
    it('should respond with a status 200 and a list of assignments', async () => {
        jest.spyOn(GetAssignments.prototype, "execute").mockResolvedValue(assignmentList);
    
        const req = createRequest();
        const res = createResponse();
    
        await controller.getAssignments(req, res);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(assignmentList);
      });
});