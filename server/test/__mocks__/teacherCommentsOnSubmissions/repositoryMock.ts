import { jest } from "@jest/globals";
import { ITeacherCommentRepository } from "../../../src/modules/TeacherCommentsOnSubmissions/Domain/ITeacherCommentRepository";

export const getTeacherCommentRepositoryMock = (): jest.Mocked<ITeacherCommentRepository> => ({
  createTeacherComment: jest.fn(),
  getTeacherCommentsBySubmission: jest.fn(),
  isTeacher: jest.fn(),
  submissionExists: jest.fn(),
});
