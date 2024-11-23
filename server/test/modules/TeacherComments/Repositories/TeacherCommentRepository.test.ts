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
});
