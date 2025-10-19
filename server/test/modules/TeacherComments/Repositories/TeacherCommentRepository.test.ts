import { Pool } from "pg";
import { TeacherCommentRepository } from "../../../../src/modules/TeacherCommentsOnSubmissions/Repositories/TeacherCommentRepository";
import { getTeacherCommentMock, getTeacherCommentResponseMock } from "../../../__mocks__/teacherCommentsOnSubmissions/dataMocks";


let repository: TeacherCommentRepository;
let poolConnectMock: jest.Mock;
let clientQueryMock: jest.Mock;

beforeEach(() => {
  poolConnectMock = jest.fn();
  clientQueryMock = jest.fn();
  poolConnectMock.mockResolvedValue({
    query: clientQueryMock,
    release: jest.fn(),
  });
  jest.spyOn(Pool.prototype, "connect").mockImplementation(poolConnectMock);
  repository = new TeacherCommentRepository();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Create Teacher Comment", () => {
  it("should create a teacher comment", async () => {
    const newComment = getTeacherCommentMock();
    const mockResponse = getTeacherCommentResponseMock();
    clientQueryMock.mockResolvedValue({ rows: [mockResponse] });

    const result = await repository.createTeacherComment(newComment);
    expect(result).toEqual(mockResponse);
  });

  it("should handle errors when creating a teacher comment", async () => {
    const newComment = getTeacherCommentMock();
    clientQueryMock.mockRejectedValue(new Error("Database error"));

    await expect(repository.createTeacherComment(newComment)).rejects.toThrow("Database error");
  });
});

describe("Get Teacher Comments by Submission", () => {
  it("should retrieve teacher comments for a submission", async () => {
    clientQueryMock.mockResolvedValue({
      rows: [getTeacherCommentResponseMock()],
    });

    const comments = await repository.getTeacherCommentsBySubmission(1);
    expect(comments).toHaveLength(1);
    expect(comments[0]).toEqual(getTeacherCommentResponseMock());
  });

  it("should return an empty array when no comments are found", async () => {
    clientQueryMock.mockResolvedValue({ rows: [] });

    const comments = await repository.getTeacherCommentsBySubmission(999);
    expect(comments).toHaveLength(0);
  });

  it("should handle errors when retrieving teacher comments", async () => {
    clientQueryMock.mockRejectedValue(new Error("Database error"));

    await expect(repository.getTeacherCommentsBySubmission(1)).rejects.toThrow("Database error");
  });
});

describe("Is Teacher", () => {
  it("should return true if the teacher exists", async () => {
    clientQueryMock.mockResolvedValue({ rows: [{ exists: true }] });

    const isTeacher = await repository.isTeacher(1);
    expect(isTeacher).toBe(true);
  });

  it("should return false if the teacher does not exist", async () => {
    clientQueryMock.mockResolvedValue({ rows: [] });

    const isTeacher = await repository.isTeacher(999);
    expect(isTeacher).toBe(false);
  });

  it("should handle errors when checking if the teacher exists", async () => {
    clientQueryMock.mockRejectedValue(new Error("Database error"));

    await expect(repository.isTeacher(1)).rejects.toThrow("Database error");
  });
});

describe("Submission Exists", () => {
  it("should return true if the submission exists", async () => {
    clientQueryMock.mockResolvedValue({ rows: [{ exists: true }] });

    const exists = await repository.submissionExists(1);
    expect(exists).toBe(true);
  });

  it("should return false if the submission does not exist", async () => {
    clientQueryMock.mockResolvedValue({ rows: [] });

    const exists = await repository.submissionExists(999);
    expect(exists).toBe(false);
  });

  it("should handle errors when checking if the submission exists", async () => {
    clientQueryMock.mockRejectedValue(new Error("Database error"));

    await expect(repository.submissionExists(1)).rejects.toThrow("Database error");
  });
});