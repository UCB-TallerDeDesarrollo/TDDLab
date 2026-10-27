import { Request } from 'express';
import { Pool } from 'pg';
import SubmissionRepository from '../../src/modules/Submissions/Repository/SubmissionsRepository';
import SubmissionController from "../../src/controllers/submissions/submissionsController";
import { getSubmissionRepositoryMock } from "../__mocks__/submissions/repositoryMock";
import { getSubmissionListMock, SubmissionInProgresDataMock } from "../__mocks__/submissions/dataTypeMocks/submissionData";
import { createRequest } from "../__mocks__/submissions/requestMock";
import { createResponse } from "../__mocks__/submissions/responseMock";
import GitHubRepositoryValidator from '../../src/modules/Submissions/Repository/GitHubRepositoryValidator';

jest.mock('../../src/modules/Submissions/Repository/GitHubRepositoryValidator', () => {
  return jest.fn().mockImplementation(() => ({
    repositoryExists: jest.fn().mockResolvedValue(true),
  }));
});

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

describe('persisted assignment lifecycle', () => {
  const query = jest.fn();
  const release = jest.fn();
  let controller: SubmissionController;
  const started = {
    id: 42, assignmentid: 7, userid: 9, status: 'in progress',
    repository_link: 'https://github.com/student/task',
    start_date: '2026-09-23', end_date: null, comment: null,
  };
  const delivered = { ...started, status: 'delivered', end_date: '2026-09-24', comment: 'Listo' };
  const request = (body = {}, params = {}, user = { id: 9, role: 'student' }) =>
    ({ body, params, user } as unknown as Request);
  const readRequest = () => request({}, { assignmentid: '7', userid: '9' });

  beforeEach(() => {
    query.mockReset();
    release.mockClear();

    (GitHubRepositoryValidator as jest.Mock).mockImplementation(() => ({
      repositoryExists: jest.fn().mockResolvedValue(true),
    }));

    jest.spyOn(Pool.prototype, 'connect').mockImplementation(() =>
      Promise.resolve({ query, release }) as any
    );
    controller = new SubmissionController(new SubmissionRepository());
  });

  afterEach(() => jest.restoreAllMocks());

  it('returns 404 before starting, and saved states after starting and finishing', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const pendingResponse = createResponse();
    await controller.getSubmissionByAssignmentAndUser(readRequest(), pendingResponse);
    expect(pendingResponse.status).toHaveBeenCalledWith(404);

    query.mockResolvedValueOnce({ rows: [{ exists: true }] })
      .mockResolvedValueOnce({ rows: [{ exists: true }] })
      .mockResolvedValueOnce({ rows: [started] });
    const startResponse = createResponse();
    await controller.CreateSubmission(request(started), startResponse);
    expect(startResponse.status).toHaveBeenCalledWith(201);
    expect(startResponse.json).toHaveBeenCalledWith(started);
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('INSERT INTO submissions'),
      [7, 9, 'in progress', started.repository_link, started.start_date]);

    query.mockResolvedValueOnce({ rows: [started] });
    const reloadResponse = createResponse();
    await controller.getSubmissionByAssignmentAndUser(readRequest(), reloadResponse);
    expect(reloadResponse.json).toHaveBeenCalledWith(started);
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('SELECT * FROM submissions'), [7, 9]);

    query.mockResolvedValueOnce({ rows: [delivered] });
    const finishResponse = createResponse();
    await controller.updateSubmission(request(delivered, { id: '42' }), finishResponse);
    expect(finishResponse.status).toHaveBeenCalledWith(200);
    expect(finishResponse.json).toHaveBeenCalledWith(delivered);
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('UPDATE submissions'),
      ['delivered', delivered.end_date, delivered.comment, 42]);

    query.mockResolvedValueOnce({ rows: [delivered] });
    const finalResponse = createResponse();
    await controller.getSubmissionByAssignmentAndUser(readRequest(), finalResponse);
    expect(finalResponse.json).toHaveBeenCalledWith(delivered);
    expect(release).toHaveBeenCalledTimes(7);
  });

  it('does not confirm completion when saving fails', async () => {
    query.mockRejectedValueOnce(new Error('Database unavailable'));
    const response = createResponse();
    await controller.updateSubmission(request(delivered, { id: '42' }), response);
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ error: 'Server error' });
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('updates only the repository link for the authenticated owner', async () => {
    const updated = {
      ...started,
      repository_link: 'https://github.com/student/updated-task',
    };
    query.mockResolvedValueOnce({ rows: [updated] });
    const response = createResponse();
    await controller.updateSubmissionRepositoryLink(
      request(
        { repository_link: updated.repository_link, status: 'delivered', comment: 'ignored' },
        { id: '42' }
      ),
      response
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(updated);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE submissions SET repository_link = $1 WHERE id = $2 AND userid = $3'),
      [updated.repository_link, 42, 9]
    );
    expect(updated).toMatchObject({
      status: started.status,
      start_date: started.start_date,
      end_date: started.end_date,
      comment: started.comment,
      assignmentid: started.assignmentid,
      userid: started.userid,
    });
  });

  it('returns 400 when the GitHub repository does not exist', async () => {
    (GitHubRepositoryValidator as jest.Mock).mockImplementation(() => ({
      repositoryExists: jest.fn().mockResolvedValue(false),
    }));

    controller = new SubmissionController(new SubmissionRepository());

    const response = createResponse();

    await controller.updateSubmissionRepositoryLink(
      request(
        { repository_link: 'https://github.com/student/non-existing-repo' },
        { id: '42' }
      ),
      response
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: 'El repositorio de GitHub no existe o no es accesible.',
    });
    expect(query).not.toHaveBeenCalled();
  });

  it('does not update a submission when it does not belong to the authenticated student', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const response = createResponse();
    await controller.updateSubmissionRepositoryLink(
      request(
        { repository_link: 'https://github.com/student/another-task' },
        { id: '42' },
        { id: 88, role: 'student' }
      ),
      response
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE id = $2 AND userid = $3'),
      ['https://github.com/student/another-task', 42, 88]
    );
  });

  it('returns 404 when the submission to edit does not exist', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const response = createResponse();
    await controller.updateSubmissionRepositoryLink(
      request({ repository_link: 'https://github.com/student/updated-task' }, { id: '404' }),
      response
    );

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('distinguishes a read failure from a task that has not started', async () => {
    query.mockRejectedValueOnce(new Error('Database unavailable'));
    const response = createResponse();
    await controller.getSubmissionByAssignmentAndUser(readRequest(), response);
    expect(response.status).toHaveBeenCalledWith(500);
  });
});
