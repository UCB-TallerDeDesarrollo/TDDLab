import SubmissionController from "../../src/controllers/submissions/submissionsController";
import { getSubmissionRepositoryMock } from "../__mocks__/submissions/repositoryMock";
import { getSubmissionListMock, SubmissionInProgresDataMock } from "../__mocks__/submissions/dataTypeMocks/submissionData";
import { createRequest } from "../__mocks__/submissions/requestMock";
import { createResponse } from "../__mocks__/submissions/responseMock";

let controller: SubmissionController;
const submissionRepositoryMock = getSubmissionRepositoryMock();

beforeEach(() => {
    controller = new SubmissionController(
        submissionRepositoryMock,
    );
});

describe("Get Submissions", () => {
    it("should respond with a status 200 and a list of submissions", async () => {
      const req = createRequest();
      const res = createResponse();
      submissionRepositoryMock.ObtainSubmissions.mockResolvedValue(
        getSubmissionListMock
      );
      await controller.getSubmissions(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(getSubmissionListMock);
    });
    it("should respond with a 500 status 500 and error message when getSubmissions fails", async () => {
      const req = createRequest();
      const res = createResponse();
      submissionRepositoryMock.ObtainSubmissions.mockRejectedValue(new Error());
      await controller.getSubmissions(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("Create Submission", () => {
    it("should respond with a status 201 and return the created assignment", async () => {
      const req = createRequest("1", SubmissionInProgresDataMock);
      const res = createResponse();
      submissionRepositoryMock.CreateSubmission.mockResolvedValue(
        SubmissionInProgresDataMock
      );
      submissionRepositoryMock.assignmentidExistsForSubmission.mockResolvedValue(
        true
      );
      submissionRepositoryMock.useridExistsForSubmission.mockResolvedValue(
        true
      );
      await controller.CreateSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(SubmissionInProgresDataMock);
    });
    it("should respond with a status 500 and error message when assignment creation fails", async () => {
      const req = createRequest(undefined, SubmissionInProgresDataMock);
      const res = createResponse();
      submissionRepositoryMock.CreateSubmission.mockRejectedValue(new Error());
      await controller.CreateSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("Delete Submission", () => {
    it("should respond with a status 204 when assignment deletion is successful", async () => {
      const req = createRequest("existing_id");
      const res = createResponse();
      submissionRepositoryMock.deleteSubmission.mockResolvedValue(undefined);
      await controller.deleteSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
    it("should respond with a status 500 and error message when assignment deletion fails", async () => {
      const req = createRequest("non_existing_id");
      const res = createResponse();
      submissionRepositoryMock.deleteSubmission.mockRejectedValue(new Error());
      await controller.deleteSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

describe("Get Submission By Assignment and User", ()=>{
  it("should respond with status code 400", async() => {
    const req = createRequest("existing_id", SubmissionInProgresDataMock);
    const res = createResponse();
    submissionRepositoryMock.getSubmissionByAssignmentAndUser.mockResolvedValue(
      SubmissionInProgresDataMock
    );
    await controller.getSubmissionByAssignmentAndUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(SubmissionInProgresDataMock);
  });
  it("should respond with a 404 status and error message when assignment and user are not found", async ()=>{
    const req = createRequest("non_existing_id", SubmissionInProgresDataMock);
    const res = createResponse();
    submissionRepositoryMock.getSubmissionByAssignmentAndUser.mockResolvedValue(null);
    await controller.getSubmissionByAssignmentAndUser(req,res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({message: "Submission not found"})
  });
  it("should respond with a 500 status and error message when fetching by assignment and user ", async ()=>{
    const req = createRequest("existing_id", SubmissionInProgresDataMock);
    const res = createResponse();
    submissionRepositoryMock.getSubmissionByAssignmentAndUser.mockRejectedValue(new Error());
    await controller.getSubmissionByAssignmentAndUser(req,res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: "Server error"})
  });
});

describe("Update Assignment", () => {
    it("should respond with a status 200 and updated assignment when update is successful", async () => {
      const req = createRequest("existing_id", SubmissionInProgresDataMock);
      const res = createResponse();
      submissionRepositoryMock.UpdateSubmission.mockResolvedValue(
        SubmissionInProgresDataMock
      );
      await controller.updateSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(SubmissionInProgresDataMock);
    });
    it("should respond with a 404 status and error message when assignment is not found", async () => {
      const req = createRequest("non_existing_id", SubmissionInProgresDataMock);
      const res = createResponse();
      submissionRepositoryMock.UpdateSubmission.mockResolvedValue(null);
      await controller.updateSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Submission not found" });
    });
    it("should respond with a 500 status and error message when update fails", async () => {
      const req = createRequest("existing_id", SubmissionInProgresDataMock);
      const res = createResponse();
      submissionRepositoryMock.UpdateSubmission.mockRejectedValue(new Error());
      await controller.updateSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
  });
  
describe("Get Submissions By Assignment Id", () => {
  it("should respond with a status 200 and a list of submissions", async () => {
    const req = createRequest("25");
    const res = createResponse();
    const submissions = getSubmissionListMock();
    
    submissionRepositoryMock.getSubmissionsByAssignmentId.mockResolvedValue(submissions);
    
    await controller.getSubmissionsByAssignmentId(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(submissions);
  });

  it("should respond with a status 500 and error message when fetching submissions fails", async () => {
    const req = createRequest("25");
    const res = createResponse();
    
    submissionRepositoryMock.getSubmissionsByAssignmentId.mockRejectedValue(new Error("Error fetching submissions"));
    
    await controller.getSubmissionsByAssignmentId(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error getSubmissionsByAssignmentId" });
  });

  it("should respond with a status 200 and an empty list if no submissions are found", async () => {
    const req = createRequest("25");
    const res = createResponse();
    
    submissionRepositoryMock.getSubmissionsByAssignmentId.mockResolvedValue([]);
    
    await controller.getSubmissionsByAssignmentId(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});