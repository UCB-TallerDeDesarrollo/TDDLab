import { jest } from "@jest/globals";
import { TeacherCommentRepository } from "../../../src/modules/TeacherCommentsOnSubmissions/Repositories/TeacherCommentRepository";

export const getTeacherCommentRepositoryMock = (): jest.Mocked<TeacherCommentRepository> => ({
  executeQuery: jest.fn(),
  createTeacherComment: jest.fn(),
  getTeacherCommentsBySubmission: jest.fn(),
  isTeacher: jest.fn(),
  submissionExists: jest.fn(),
  pool: {
    connect: jest.fn(),
    query: jest.fn(),
    release: jest.fn(),
  } as any, // Puedes ajustar esto según el uso de `pool` en tu código
});
