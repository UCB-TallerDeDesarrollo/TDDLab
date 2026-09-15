import { Request, Response } from "express";
import { ITeacherCommentRepository } from "../../modules/TeacherCommentsOnSubmissions/Domain/ITeacherCommentRepository";
import { createTeacherComment } from "../../modules/TeacherCommentsOnSubmissions/Application/CreateTeacherComment";
import { getTeacherComments } from "../../modules/TeacherCommentsOnSubmissions/Application/getTeacherComments";

export class TeacherCommentController {
  private readonly teacherCommentRepository: ITeacherCommentRepository;

  constructor(teacherCommentRepository: ITeacherCommentRepository) {
    this.teacherCommentRepository = teacherCommentRepository;
  }

  public async addComment(req: Request, res: Response) {
    const { submission_id, teacher_id, content } = req.body;
  
    try {
      const isTeacher = await this.teacherCommentRepository.isTeacher(teacher_id);
      if (!isTeacher) {
        return res.status(403).json({ error: "El usuario no tiene permiso para agregar comentarios." });
      }

      const exists = await this.teacherCommentRepository.submissionExists(submission_id);
      if (!exists) {
        return res.status(404).json({ error: "La entrega no existe." });
      }

      const newComment = await createTeacherComment(
        { submission_id, teacher_id, content },
        this.teacherCommentRepository
      );
      return res.status(201).json(newComment);
    } catch (error) {
      console.error("Error adding comment:", error);
      return res.status(500).json({ error: "Error creando el comentario" });
    }
  }
  

  public async getComments(req: Request, res: Response) {
    const { submission_id } = req.params;

    try {
      const exists = await this.teacherCommentRepository.submissionExists(Number(submission_id));
      if (!exists) {
        return res.status(404).json({ error: "Submission not found" });
      }
      const comments = await getTeacherComments(Number(submission_id), this.teacherCommentRepository);
      return res.status(200).json(comments);
    } catch (error) {
      return res.status(500).json({ error: "Error retrieving comments" });
    }
  }
}
