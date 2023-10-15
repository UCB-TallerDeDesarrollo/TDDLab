import AssignmentsController from "../../src/controllers/assignments/assignmentController";
import GetAssignments from "../../src/modules/Assignments/application/AssignmentUseCases/getAssignmentsUseCase";
import AssignmentRepository from "../../src/modules/Assignments/repositories/AssignmentRepository";

import { assignmentList } from "./__mocks__/dataTypeMocks/assignmentListData"
import { assignment } from "./__mocks__/dataTypeMocks/assignmentData"
import { createRequest, createRequestWithBody, createRequestWithId } from "./__mocks__/requestMocks";
import { createResponse } from "./__mocks__/responseMoks";
import GetAssignmentById from "../../src/modules/Assignments/application/AssignmentUseCases/getAssignmentByIdUseCase";
import CreateAssignment from "../../src/modules/Assignments/application/AssignmentUseCases/createAssignmentUseCase";

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
      it('should respond with a 500 status 500 and error message when getAssignments fails', async () => {
        jest.spyOn(GetAssignments.prototype, "execute").mockRejectedValue(new Error);
        const req = createRequest();
        const res = createResponse();
        await controller.getAssignments(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
      });
});

describe('Get assignment by id', () => {
    it('should respond with a status 200 and the assignments', async () => {
      jest.spyOn(GetAssignmentById.prototype, "execute").mockResolvedValue(assignment);
      const req = createRequestWithId('Tarea 1');
      const res = createResponse();
      await controller.getAssignmentById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(assignment);
    });
    it('should respond with a status 404 and an error message for non-existent assignment', async () => {
        jest.spyOn(GetAssignmentById.prototype, "execute").mockResolvedValue(null);
        const req = createRequestWithId('non_existent_id');
        const res = createResponse();
        await controller.getAssignmentById(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Assignment not found" });
    });
    it('should respond with a status 500 and error message when getAssignmentsById fails', async () => {
        const req = createRequest();
        const res = createResponse();
        await controller.getAssignmentById(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe('Create Assignment', () => {
    it('should respond with a 201 status and return the created assignment', async () => {
      jest.spyOn(CreateAssignment.prototype, "execute").mockResolvedValue(assignment);
      const req = createRequestWithBody(assignment);
      const res = createResponse();
      await controller.createAssignment(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(assignment);
    });
});