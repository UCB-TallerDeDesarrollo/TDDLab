import AssignmentsController from "../../src/controllers/assignments/assignmentController";
import GetAssignments from "../../src/modules/Assignments/application/AssignmentUseCases/getAssignmentsUseCase";
import AssignmentRepository from "../../src/modules/Assignments/repositories/AssignmentRepository";

import { assignmentList } from "./__mocks__/dataTypeMocks/assignmentListData"
import { assignment } from "./__mocks__/dataTypeMocks/assignmentData"
import { createRequest } from "./__mocks__/requestMocks";
import { createResponse } from "./__mocks__/responseMoks";
import GetAssignmentById from "../../src/modules/Assignments/application/AssignmentUseCases/getAssignmentByIdUseCase";
import CreateAssignment from "../../src/modules/Assignments/application/AssignmentUseCases/createAssignmentUseCase";
import DeleteAssignment from "../../src/modules/Assignments/application/AssignmentUseCases/deleteAssignmentUseCase";
import UpdateAssignment from "../../src/modules/Assignments/application/AssignmentUseCases/updateAssignmentUseCase";

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
      const req = createRequest('Tarea 1');
      const res = createResponse();
      await controller.getAssignmentById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(assignment);
    });
    it('should respond with a status 404 and an error message for non-existent assignment', async () => {
        jest.spyOn(GetAssignmentById.prototype, "execute").mockResolvedValue(null);
        const req = createRequest('non_existent_id');
        const res = createResponse();
        await controller.getAssignmentById(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Assignment not found" });
    });
    it('should respond with a status 500 and error message when getAssignmentsById fails', async () => {
        jest.spyOn(GetAssignmentById.prototype, "execute").mockRejectedValue(new Error);
        const req = createRequest();
        const res = createResponse();
        await controller.getAssignmentById(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe('Create Assignment', () => {
    it('should respond with a status 201 and return the created assignment', async () => {
      jest.spyOn(CreateAssignment.prototype, "execute").mockResolvedValue(assignment);
      const req = createRequest(undefined, assignment);
      const res = createResponse();
      await controller.createAssignment(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(assignment);
    });
    it('should respond with a status 500 and error message when assignment creation fails', async () => {
        jest.spyOn(CreateAssignment.prototype, "execute").mockRejectedValue(new Error);
        const req = createRequest(undefined, assignment);
        const res = createResponse();
        await controller.createAssignment(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe('Delete Assignment', () => {
    it('should respond with a status 204 when assignment deletion is successful', async () => {
      jest.spyOn(DeleteAssignment.prototype, "execute").mockResolvedValue(undefined);
      const req = createRequest('existing_id');
      const res = createResponse();
      await controller.deleteAssignment(req, res);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
    it('should respond with a status 500 and error message when assignment deletion fails', async () => {    
        jest.spyOn(DeleteAssignment.prototype, "execute").mockRejectedValue(new Error("Error deleting assignment"));
        const req = createRequest('non_existing_id');
        const res = createResponse();
        await controller.deleteAssignment(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe('Update Assignment', () => {
    it('should respond with a 200 status and updated assignment when update is successful', async () => {
      jest.spyOn(UpdateAssignment.prototype, 'execute').mockResolvedValue(assignment);
      const req = createRequest('existing_id', assignment)
      const res = createResponse();
      await controller.updateAssignment(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(assignment);
    });
});