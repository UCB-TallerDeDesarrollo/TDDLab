import AssignmentsController from "../../src/controllers/assignments/assignmentController";

import { getAssignmentRepositoryMock } from "../__mocks__/assignments/repositoryMock"
import { getAssignmentListMock, getAssignmentMock } from "../__mocks__/assignments/dataTypeMocks/assignmentData"
import { createRequest } from "../__mocks__/assignments/requestMocks";
import { createResponse } from "../__mocks__/assignments/responseMoks";

let controller: AssignmentsController;
const assignmentRepositoryMock = getAssignmentRepositoryMock();

beforeEach(() => {
  controller = new AssignmentsController(assignmentRepositoryMock);
});

describe('Get assignments', () => {
  it('should respond with a status 200 and a list of assignments', async () => {
    const req = createRequest();
    const res = createResponse();
    assignmentRepositoryMock.obtainAssignments.mockResolvedValue(getAssignmentListMock);
    await controller.getAssignments(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(getAssignmentListMock);
  });
  it('should respond with a 500 status 500 and error message when getAssignments fails', async () => {
    const req = createRequest();
    const res = createResponse();
    assignmentRepositoryMock.obtainAssignments.mockRejectedValue(new Error);
    await controller.getAssignments(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

describe('Get assignment by id', () => {
  it('should respond with a status 200 and the assignments', async () => {
    const req = createRequest('Tarea 1');
    const res = createResponse();
    assignmentRepositoryMock.obtainAssignmentById.mockResolvedValue(getAssignmentMock());
    await controller.getAssignmentById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(getAssignmentMock());
  });
  it('should respond with a status 404 and an error message for non-existent assignment', async () => {
    const req = createRequest('non_existent_id');
    const res = createResponse();
    assignmentRepositoryMock.obtainAssignmentById.mockResolvedValue(null);
    await controller.getAssignmentById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Assignment not found" });
  });
  it('should respond with a status 500 and error message when getAssignmentsById fails', async () => {
    const req = createRequest();
    const res = createResponse();
    assignmentRepositoryMock.obtainAssignmentById.mockRejectedValue(new Error);
    await controller.getAssignmentById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

describe('Create Assignment', () => {
  it('should respond with a status 201 and return the created assignment', async () => {
    const req = createRequest(undefined, getAssignmentMock());
    const res = createResponse();
    assignmentRepositoryMock.createAssignment.mockResolvedValue(getAssignmentMock);
    await controller.createAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(getAssignmentMock);
  });
  it('should respond with a status 500 and error message when assignment creation fails', async () => {
    const req = createRequest(undefined, getAssignmentMock());
    const res = createResponse();
    assignmentRepositoryMock.createAssignment.mockRejectedValue(new Error)
    await controller.createAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

describe('Delete Assignment', () => {
  it('should respond with a status 204 when assignment deletion is successful', async () => {
    const req = createRequest('existing_id');
    const res = createResponse();
    assignmentRepositoryMock.deleteAssignment.mockResolvedValue(undefined);
    await controller.deleteAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
  it('should respond with a status 500 and error message when assignment deletion fails', async () => {    
    const req = createRequest('non_existing_id');
    const res = createResponse();
    assignmentRepositoryMock.deleteAssignment.mockRejectedValue(new Error);
    await controller.deleteAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

describe('Deliver Assignment', () => {
  const assignmentRepositoryMock = getAssignmentRepositoryMock();
  const controller = new AssignmentsController(assignmentRepositoryMock);
  it('should respond with a status 200 and delivered assignment when delivery is successful', async () => {
    const req = createRequest('existing_id', undefined, 'https://example.com/assignment');
    const res = createResponse();
    await controller.deliverAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Tarea 1',
      link: 'https://example.com/assignment',
    }));
  });
  it("should respond with a status 500 and error message when an error occurs during delivery", async () => {
    const req = createRequest('id', undefined, 'https://example.com/assignment');
    const res = createResponse();
    await controller.deliverAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

describe('Update Assignment', () => {
  it('should respond with a status 200 and updated assignment when update is successful', async () => {
    const req = createRequest('existing_id', getAssignmentMock())
    const res = createResponse();
    assignmentRepositoryMock.updateAssignment.mockResolvedValue(getAssignmentMock);
    await controller.updateAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(getAssignmentMock);
  });
  it('should respond with a 404 status and error message when assignment is not found', async () => {
    const req = createRequest('non_existing_id', getAssignmentMock());
    const res = createResponse();
    assignmentRepositoryMock.updateAssignment.mockResolvedValue(null);
    await controller.updateAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Assignment not found' });
  });
  it('should respond with a 500 status and error message when update fails', async () => {
    const req = createRequest('existing_id', getAssignmentMock());
    const res = createResponse();
    assignmentRepositoryMock.updateAssignment.mockRejectedValue(new Error);
    await controller.updateAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
  });
});
