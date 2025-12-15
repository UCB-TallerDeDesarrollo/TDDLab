import AssignmentController from "../../src/controllers/assignments/assignmentController";
import { getAssignmentRepositoryMock } from "../__mocks__/assignments/repositoryMock";
import {
  getAssignmentListMock,
  assignmentPendingDataMock,
} from "../__mocks__/assignments/dataTypeMocks/assignmentData";
import { createRequest } from "../__mocks__/assignments/requestMocks";
import { createResponse } from "../__mocks__/assignments/responseMoks";

let controller: AssignmentController;
const assignmentRepositoryMock = getAssignmentRepositoryMock();

beforeEach(() => {
  controller = new AssignmentController(assignmentRepositoryMock);
});

describe("Get assignments by group ID", () => {
  it("should respond with status 200 and list of assignments for a valid group ID", async () => {
    const req = createRequest("1");
    const res = createResponse();
    assignmentRepositoryMock.obtainAssignmentsByGroupId.mockResolvedValue(
      getAssignmentListMock()
    );

    await controller.getAssignmentsByGroupId(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(getAssignmentListMock());
  });
  it("should respond with status 500 and error message when obtaining assignments fails", async () => {
    const req = createRequest("1");
    const res = createResponse();
    const error = new Error("Failed to obtain assignments");
    assignmentRepositoryMock.obtainAssignmentsByGroupId.mockRejectedValue(
      error
    );

    await controller.getAssignmentsByGroupId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

describe("Get assignments", () => {
  it("should respond with a status 200 and a list of assignments", async () => {
    const req = createRequest();
    const res = createResponse();
    assignmentRepositoryMock.obtainAssignments.mockResolvedValue(
      getAssignmentListMock
    );
    await controller.getAssignments(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(getAssignmentListMock);
  });
  it("should respond with a 500 status 500 and error message when getAssignments fails", async () => {
    const req = createRequest();
    const res = createResponse();
    assignmentRepositoryMock.obtainAssignments.mockRejectedValue(new Error());
    await controller.getAssignments(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

describe("Get assignment by id", () => {
  it("should respond with a status 200 and the assignments", async () => {
    const req = createRequest("Tarea 1");
    const res = createResponse();
    assignmentRepositoryMock.obtainAssignmentById.mockResolvedValue(
      assignmentPendingDataMock
    );
    await controller.getAssignmentById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(assignmentPendingDataMock);
  });
  it("should respond with a status 404 and an error message for non-existent assignment", async () => {
    const req = createRequest("non_existent_id");
    const res = createResponse();
    assignmentRepositoryMock.obtainAssignmentById.mockResolvedValue(null);
    await controller.getAssignmentById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Assignments not found" });
  });
  it("should respond with a status 500 and error message when getAssignmentsById fails", async () => {
    const req = createRequest();
    const res = createResponse();
    assignmentRepositoryMock.obtainAssignmentById.mockRejectedValue(
      new Error()
    );
    await controller.getAssignmentById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

describe("Create Assignment", () => {
  it("should respond with a status 201 and return the created assignment", async () => {
    const req = createRequest("1", assignmentPendingDataMock);
    const res = createResponse();
    assignmentRepositoryMock.createAssignment.mockResolvedValue(
      assignmentPendingDataMock
    );
    assignmentRepositoryMock.groupidExistsForAssigment.mockResolvedValue(true);
    await controller.createAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(assignmentPendingDataMock);
  });
  it("should respond with a status 500 and error message when assignment creation fails", async () => {
    const req = createRequest(undefined, assignmentPendingDataMock);
    const res = createResponse();
    assignmentRepositoryMock.createAssignment.mockRejectedValue(new Error());
    await controller.createAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

describe("Delete Assignment", () => {
  it("should respond with 200 when assignment is deleted successfully", async () => {
    const req = createRequest("1");
    const res = createResponse();
    (controller as any).getAssignmentByIdUseCase.execute = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    (controller as any).deleteAssignmentUseCase.execute = jest
      .fn()
      .mockResolvedValue(true);
    await controller.deleteAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Tarea eliminada correctamente",
    });
  });
  it("should respond with 400 when ID is invalid", async () => {
    const req = createRequest("");
    const res = createResponse();

    await controller.deleteAssignment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "ID de tarea es requerido",
    });
  });

  it("should respond with 404 when assignment is not found", async () => {
    const req = createRequest("99");
    const res = createResponse();
    (controller as any).getAssignmentByIdUseCase.execute = jest
      .fn()
      .mockResolvedValue(null);
    (controller as any).deleteAssignmentUseCase.execute = jest
      .fn()
      .mockResolvedValue(false);

    await controller.deleteAssignment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Tarea no encontrada",
    });
  });
});

describe("Deliver Assignment", () => {
  const assignmentRepositoryMock = getAssignmentRepositoryMock();
  const controller = new AssignmentController(assignmentRepositoryMock);
  it("should respond with a status 200 and delivered assignment when delivery is successful", async () => {
    const req = createRequest(
      "id_assignment_pending",
      undefined,
      "https://example.com/assignment"
    );
    const res = createResponse();
    await controller.deliverAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      comment: "Comentario",
      description: "Esta es una tarea pendiente",
      end_date: new Date("2023-01-10T00:00:00.000Z"),
      groupid: 1,
      id: "1",
      link: "https://example.com/assignment",
      start_date: new Date("2023-01-01T00:00:00.000Z"),
      state: "in progress",
      title: "Tarea pendiente",
    });
  });
  it("should respond with a status 404 and error message when assignment is not found during delivery", async () => {
    const req = createRequest(
      "non_existing_id",
      undefined,
      "https://example.com/assignment"
    );
    const res = createResponse();
    await controller.deliverAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Assignment not found" });
  });
  it("should respond with a status 500 and error message when an error occurs during delivery", async () => {
    const req = createRequest(
      "id",
      undefined,
      "https://example.com/assignment"
    );
    const res = createResponse();
    (controller as any).deliverAssignmentUseCase.execute = jest.fn()
      .mockRejectedValue(new Error());
    await controller.deliverAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});

describe("Update Assignment", () => {
  it("should respond with a status 200 and updated assignment when update is successful", async () => {
    const req = createRequest("existing_id", assignmentPendingDataMock);
    const res = createResponse();
     (controller as any).updateAssignmentUseCase.execute = jest.fn()
      .mockResolvedValue(assignmentPendingDataMock);
    assignmentRepositoryMock.updateAssignment.mockResolvedValue(
      assignmentPendingDataMock
    );
    await controller.updateAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(assignmentPendingDataMock);
  });
  it("should respond with a 404 status and error message when assignment is not found", async () => {
    const req = createRequest("non_existing_id", assignmentPendingDataMock);
    const res = createResponse();
     (controller as any).updateAssignmentUseCase.execute = jest.fn()
      .mockResolvedValue(null);
    await controller.updateAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Assignment not found" });
  });
  it("should respond with a 500 status and error message when update fails", async () => {
    const req = createRequest("existing_id", assignmentPendingDataMock);
    const res = createResponse();
    assignmentRepositoryMock.updateAssignment.mockRejectedValue(new Error());
    await controller.updateAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});