import { TeacherCommentController } from "../../src/controllers/teacherCommentsOnSubmissions/teacherCommentsOnSubmissionsController";
import { getTeacherCommentRepositoryMock } from "../__mocks__/teacherCommentsOnSubmissions/repositoryMock";
import { Request, Response } from "express";

let controller: TeacherCommentController;
const teacherCommentRepositoryMock = getTeacherCommentRepositoryMock();

beforeEach(() => {
  controller = new TeacherCommentController(teacherCommentRepositoryMock);
});

describe("TeacherCommentController", () => {
  describe("addComment", () => {
    it("debería devolver 403 si el usuario no es un profesor", async () => {
      teacherCommentRepositoryMock.isTeacher.mockResolvedValue(false);

      const req = {
        body: { submission_id: 1, teacher_id: 2, content: "Test comment" },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.addComment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "El usuario no tiene permiso para agregar comentarios." });
    });

    it("debería devolver 201 si el comentario se creó con éxito", async () => {
      teacherCommentRepositoryMock.isTeacher.mockResolvedValue(true);
      teacherCommentRepositoryMock.submissionExists.mockResolvedValue(true);
      teacherCommentRepositoryMock.createTeacherComment.mockResolvedValue({
        id: 1,
        submission_id: 1,
        teacher_id: 2,
        content: "Test comment",
        created_at: new Date(),
      });

      const req = {
        body: { submission_id: 1, teacher_id: 2, content: "Test comment" },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.addComment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        submission_id: 1,
        teacher_id: 2,
        content: "Test comment",
        created_at: expect.any(Date),
      });
    });

    it("debería devolver 500 en caso de un error interno", async () => {
      teacherCommentRepositoryMock.isTeacher.mockRejectedValue(new Error("Database error"));
      
      const req = {
        body: { submission_id: 1, teacher_id: 2, content: "Test comment" },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.addComment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error creando el comentario" });
    });
  });

  describe("getComments", () => {
    it("debería devolver 200 con los comentarios de una entrega", async () => {
      teacherCommentRepositoryMock.submissionExists.mockResolvedValue(true);
      teacherCommentRepositoryMock.getTeacherCommentsBySubmission.mockResolvedValue([
        { id: 1, submission_id: 1, teacher_id: 2, content: "Comment 1", created_at: new Date() },
      ]);

      const req = {
        params: { submission_id: "1" },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.getComments(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 1,
          submission_id: 1,
          teacher_id: 2,
          content: "Comment 1",
          created_at: expect.any(Date),
        },
      ]);
    });

    it("debería devolver 404 si la entrega no existe", async () => {
      teacherCommentRepositoryMock.submissionExists.mockResolvedValue(false);

      const req = {
        params: { submission_id: "999" },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.getComments(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Submission not found" });
    });

    it("debería devolver 500 en caso de un error interno", async () => {
      teacherCommentRepositoryMock.submissionExists.mockRejectedValue(new Error("Database error"));

      const req = {
        params: { submission_id: "1" },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.getComments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error retrieving comments" });
    });
  });
});
