import { Request } from 'express';
import { Pool } from 'pg';
import SubmissionRepository from '../../src/modules/Submissions/Repository/SubmissionsRepository';
import PracticeSubmissionController from "../../src/controllers/PracticeSubmissions/PracticeSubmissionsController";
import PracticeSubmissionRepository from "../../src/modules/PracticeSubmissions/Repository/PracticeSubmissionsRepository";
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
      const req = createRequest("existing_id", { status: SubmissionInProgresDataMock.status, end_date: SubmissionInProgresDataMock.end_date, comment: SubmissionInProgresDataMock.comment });
      const res = createResponse();
      submissionRepositoryMock.UpdateSubmission.mockResolvedValue(
        SubmissionInProgresDataMock
      );
      await controller.updateSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(SubmissionInProgresDataMock);
    });
    it("should respond with a 404 status and error message when assignment is not found", async () => {
      const req = createRequest("non_existing_id", { status: SubmissionInProgresDataMock.status, end_date: SubmissionInProgresDataMock.end_date, comment: SubmissionInProgresDataMock.comment });
      const res = createResponse();
      submissionRepositoryMock.UpdateSubmission.mockResolvedValue(null);
      await controller.updateSubmission(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Submission not found" });
    });
    it("should respond with a 500 status and error message when update fails", async () => {
      const req = createRequest("existing_id", { status: SubmissionInProgresDataMock.status, end_date: SubmissionInProgresDataMock.end_date, comment: SubmissionInProgresDataMock.comment });
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

// Exercise the controller, use cases and SQL repository together. Only PostgreSQL is mocked.
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
  const request = (body = {}, params = {}) => ({ body, params } as Request);
  const readRequest = () => request({}, { assignmentid: '7', userid: '9' });

  beforeEach(() => {
    query.mockReset();
    release.mockClear();
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
    await controller.updateSubmission(request({ status: delivered.status, end_date: delivered.end_date, comment: delivered.comment }, { id: '42' }), finishResponse);
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
    await controller.updateSubmission(request({ status: delivered.status, end_date: delivered.end_date, comment: delivered.comment }, { id: '42' }), response);
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ error: 'Server error' });
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('distinguishes a read failure from a task that has not started', async () => {
    query.mockRejectedValueOnce(new Error('Database unavailable'));
    const response = createResponse();
    await controller.getSubmissionByAssignmentAndUser(readRequest(), response);
    expect(response.status).toHaveBeenCalledWith(500);
  });
});


describe.each(["task", "practice"])("HU-05 %s repository editing", (kind) => {
    const newLink = "https://github.com/student/corrected";
    const saved = {
        id: 42, ...(kind === "task" ? { assignmentid: 7 } : { practiceid: 538 }), userid: 9, status: "in progress",
        repository_link: newLink, start_date: "2026-09-23", end_date: "2026-09-24", comment: "Listo",
    };
    function setup() {
        const repository = kind === "task" ? new SubmissionRepository() : new PracticeSubmissionRepository();
        const query = jest.spyOn(repository, "executeQuery").mockResolvedValue([saved]);
        const controller = kind === "task"
            ? new SubmissionController(repository as SubmissionRepository)
            : new PracticeSubmissionController(repository as PracticeSubmissionRepository);
        return { query, controller };
    }
    function request(link: unknown = newLink, role = "student", id = "42") {
        return Object.assign(createRequest(id, { repository_link: link }), { user: { id: 9, role } });
    }
    afterEach(() => jest.restoreAllMocks());

    it("updates only the owner's repository and returns the saved dates, status and comment", async () => {
        const { controller, query } = setup();
        const response = createResponse();
        await controller.updateRepositoryLink(request(), response);
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith(expect.objectContaining(saved));
        expect(query).toHaveBeenCalledWith(
            `UPDATE ${kind === "task" ? "submissions" : "practicesubmissions"} SET repository_link = $1 WHERE id = $2 AND userid = $3 AND status = 'in progress' RETURNING *`,
            [newLink, 42, 9]
        );
    });

    it.each(["", null, 123, "not-a-url", "https://evil.com/github.com/user/repo", "https://github.com/user", "https://github.com/user/repo.git", "https://github.com/user/repo/tree/main"])(
        "rejects invalid URL %s before querying the database", async (link) => {
            const { controller, query } = setup();
            const response = createResponse();
            await controller.updateRepositoryLink(request(link), response);
            expect(response.status).toHaveBeenCalledWith(400);
            expect(query).not.toHaveBeenCalled();
        }
    );

    it.each(["teacher", "admin", ""])("forbids repository editing for %s", async (role) => {
        const { controller, query } = setup();
        const response = createResponse();
        await controller.updateRepositoryLink(request(newLink, role), response);
        expect(response.status).toHaveBeenCalledWith(403);
        expect(query).not.toHaveBeenCalled();
    });

    it("does not allow updating another student's submission", async () => {
        const { controller, query } = setup();
        query.mockResolvedValue([]);
        const response = createResponse();
        await controller.updateRepositoryLink(request(), response);
        expect(response.status).toHaveBeenCalledWith(404);
        expect(query).toHaveBeenCalledWith(expect.stringContaining("AND userid = $3"), [newLink, 42, 9]);
    });

    it("returns a save error when the database fails", async () => {
        const { controller, query } = setup();
        query.mockRejectedValue(new Error("Database error"));
        const response = createResponse();
        await controller.updateRepositoryLink(request(), response);
        expect(response.status).toHaveBeenCalledWith(500);
    });

    it("saves the edited URL atomically with finalization and blocks later edits", async () => {
        const { controller, query } = setup();
        const finalized = { ...saved, status: "delivered" };
        query.mockResolvedValueOnce([finalized]).mockResolvedValue([]);
        const req = Object.assign(createRequest("42", {
            status: "delivered", end_date: saved.end_date, comment: saved.comment, repository_link: newLink,
        }), { user: { id: 9, role: "student" } });
        const response = createResponse();
        if (kind === "task") {
            await (controller as SubmissionController).updateSubmission(req, response);
        } else {
            await (controller as PracticeSubmissionController).updatePracticeSubmission(req, response);
        }
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith(finalized);
        expect(query).toHaveBeenCalledWith(
            `UPDATE ${kind === "task" ? "submissions" : "practicesubmissions"} SET status = $1, end_date = $2, comment = $3, repository_link = $4 WHERE id = $5 AND userid = $6 AND status = 'in progress' RETURNING *`,
            ["delivered", saved.end_date, saved.comment, newLink, 42, 9]
        );
        const laterResponse = createResponse();
        await controller.updateRepositoryLink(request(), laterResponse);
        expect(laterResponse.status).toHaveBeenCalledWith(404);
        expect(query).toHaveBeenLastCalledWith(expect.stringContaining("AND status = 'in progress'"), [newLink, 42, 9]);
        const repeated = createResponse();
        if (kind === "task") await (controller as SubmissionController).updateSubmission(req, repeated);
        else await (controller as PracticeSubmissionController).updatePracticeSubmission(req, repeated);
        expect(repeated.status).toHaveBeenCalledWith(404);
    });

    it("rejects invalid repository changes during finalization without updating", async () => {
        const { controller, query } = setup();
        const req = Object.assign(createRequest("42", {
            status: "delivered", end_date: saved.end_date, comment: saved.comment, repository_link: "https://evil.com/user/repo",
        }), { user: { id: 9, role: "student" } });
        const response = createResponse();
        if (kind === "task") await (controller as SubmissionController).updateSubmission(req, response);
        else await (controller as PracticeSubmissionController).updatePracticeSubmission(req, response);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(query).not.toHaveBeenCalled();
    });

    it("forbids finalizing an edited repository as a teacher", async () => {
        const { controller, query } = setup();
        const req = Object.assign(createRequest("42", {
            status: "delivered", end_date: saved.end_date, comment: saved.comment, repository_link: newLink,
        }), { user: { id: 9, role: "teacher" } });
        const response = createResponse();
        if (kind === "task") await (controller as SubmissionController).updateSubmission(req, response);
        else await (controller as PracticeSubmissionController).updatePracticeSubmission(req, response);
        expect(response.status).toHaveBeenCalledWith(403);
        expect(query).not.toHaveBeenCalled();
    });

    it("preserves the save error response when finalization with a new link fails", async () => {
        const { controller, query } = setup();
        query.mockRejectedValue(new Error("Database error"));
        const req = Object.assign(createRequest("42", {
            status: "delivered", end_date: saved.end_date, comment: saved.comment, repository_link: newLink,
        }), { user: { id: 9, role: "student" } });
        const response = createResponse();
        if (kind === "task") await (controller as SubmissionController).updateSubmission(req, response);
        else await (controller as PracticeSubmissionController).updatePracticeSubmission(req, response);
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({ error: "Server error" });
    });

    it("rejects malformed IDs before querying", async () => {
        const { controller, query } = setup();
        const response = createResponse();
        await controller.updateRepositoryLink(request(newLink, "student", "42-invalid"), response);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(query).not.toHaveBeenCalled();
    });
});
