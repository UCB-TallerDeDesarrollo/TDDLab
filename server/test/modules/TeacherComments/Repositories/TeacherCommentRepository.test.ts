import { PostgresTeacherCommentRepository } from "../../../../src/modules/TeacherCommentsOnSubmissions/Infrastructure/PostgresTeacherCommentRepository";
import { getTeacherCommentMock, getTeacherCommentResponseMock } from "../../../__mocks__/teacherCommentsOnSubmissions/dataMocks";
import { IDatabaseConnection, IDatabaseConnectionFactory } from "../../../../src/modules/Shared/Domain/IDatabaseConnectionFactory";

let repository: PostgresTeacherCommentRepository;
let mockConnection: jest.Mocked<IDatabaseConnection>;
let mockConnectionFactory: jest.Mocked<IDatabaseConnectionFactory>;

beforeEach(() => {
  mockConnection = {
    query: jest.fn(),
    release: jest.fn(),
  } as unknown as jest.Mocked<IDatabaseConnection>;

  mockConnectionFactory = {
    getConnection: jest.fn().mockResolvedValue(mockConnection),
  } as unknown as jest.Mocked<IDatabaseConnectionFactory>;

  repository = new PostgresTeacherCommentRepository(mockConnectionFactory);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Create Teacher Comment", () => {
  it("should create a teacher comment", async () => {
    const newComment = getTeacherCommentMock();
    const mockResponse = getTeacherCommentResponseMock();
    mockConnection.query.mockResolvedValue({ rows: [mockResponse] } as any);

    const result = await repository.createTeacherComment(newComment);
    expect(result).toEqual(mockResponse);
  });

  it("should handle errors when creating a teacher comment", async () => {
    const newComment = getTeacherCommentMock();
    mockConnection.query.mockRejectedValue(new Error("Database error"));

    await expect(repository.createTeacherComment(newComment)).rejects.toThrow("Database error");
  });
});

describe("Get Teacher Comments by Submission", () => {
  it("should retrieve teacher comments for a submission", async () => {
    mockConnection.query.mockResolvedValue({
      rows: [getTeacherCommentResponseMock()],
    } as any);

    const comments = await repository.getTeacherCommentsBySubmission(1);
    expect(comments).toHaveLength(1);
    expect(comments[0]).toEqual(getTeacherCommentResponseMock());
  });

  it("should return an empty array when no comments are found", async () => {
    mockConnection.query.mockResolvedValue({ rows: [] } as any);

    const comments = await repository.getTeacherCommentsBySubmission(999);
    expect(comments).toHaveLength(0);
  });

  it("should handle errors when retrieving teacher comments", async () => {
    mockConnection.query.mockRejectedValue(new Error("Database error"));

    await expect(repository.getTeacherCommentsBySubmission(1)).rejects.toThrow("Database error");
  });
});

describe("Is Teacher", () => {
  it("should return true if the teacher exists", async () => {
    mockConnection.query.mockResolvedValue({ rows: [{ exists: true }] } as any);

    const isTeacher = await repository.isTeacher(1);
    expect(isTeacher).toBe(true);
  });

  it("should return false if the teacher does not exist", async () => {
    mockConnection.query.mockResolvedValue({ rows: [] } as any);

    const isTeacher = await repository.isTeacher(999);
    expect(isTeacher).toBe(false);
  });

  it("should handle errors when checking if the teacher exists", async () => {
    mockConnection.query.mockRejectedValue(new Error("Database error"));

    await expect(repository.isTeacher(1)).rejects.toThrow("Database error");
  });
});

describe("Submission Exists", () => {
  it("should return true if the submission exists", async () => {
    mockConnection.query.mockResolvedValue({ rows: [{ exists: true }] } as any);

    const exists = await repository.submissionExists(1);
    expect(exists).toBe(true);
  });

  it("should return false if the submission does not exist", async () => {
    mockConnection.query.mockResolvedValue({ rows: [] } as any);

    const exists = await repository.submissionExists(999);
    expect(exists).toBe(false);
  });

  it("should handle errors when checking if the submission exists", async () => {
    mockConnection.query.mockRejectedValue(new Error("Database error"));

    await expect(repository.submissionExists(1)).rejects.toThrow("Database error");
  });
});
