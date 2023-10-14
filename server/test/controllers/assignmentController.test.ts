import { Request, Response } from "express";
import AssignmentsController from "../../src/controllers/assignments/assignmentController";
import AssignmentRepository from "../../src/modules/Assignments/repositories/AssignmentRepository";
import GetAssignments from "../../src/modules/Assignments/application/AssignmentUseCases/getAssignmentsUseCase";

describe('Get assignments', () => {
  let controller: AssignmentsController;
  let repository: AssignmentRepository;

  beforeEach(() => {
    repository = new AssignmentRepository();
    controller = new AssignmentsController(repository);
  });

  it('should return a 500 status and error message when getAssignments fails', async () => {
    jest.spyOn(GetAssignments.prototype, "execute").mockRejectedValue(new Error("Error"));
    const req = {} as Request;
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;

    await controller.getAssignments(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
  });
});
