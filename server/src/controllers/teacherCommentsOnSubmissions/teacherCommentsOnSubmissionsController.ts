import { Request, Response } from "express";
import { TeacherCommentRepository } from "../../modules/TeacherCommentsOnSubmissions/Repositories/TeacherCommentRepository";
import { createTeacherComment } from "../../modules/TeacherCommentsOnSubmissions/Application/CreateTeacherComment";
import { getTeacherComments } from "../../modules/TeacherCommentsOnSubmissions/Application/getTeacherComments";

export class TeacherCommentController {
  private readonly teacherCommentRepository: TeacherCommentRepository;

  constructor(teacherCommentRepository: TeacherCommentRepository) {
    this.teacherCommentRepository = teacherCommentRepository;
  }

  public async addComment(req: Request, res: Response) {
    const { submission_id, teacher_id, content } = req.body;
  
    try {
      // Verificar si el teacher_id corresponde a un profesor
      const isTeacher = await this.teacherCommentRepository.isTeacher(teacher_id);
      if (!isTeacher) {
        return res.status(403).json({ error: "El usuario no tiene permiso para agregar comentarios." });
      }

      // Verificar si el submission_id existe
      const exists = await this.teacherCommentRepository.submissionExists(submission_id);
      if (!exists) {
        return res.status(404).json({ error: "La entrega no existe." });
      }

      // Si las validaciones pasan, crear el comentario
      const newComment = await createTeacherComment(
        { submission_id, teacher_id, content },
        this.teacherCommentRepository
      );
      console.log("new comment");
      return res.status(201).json(newComment);
    } catch (error) {
      console.error("Error adding comment:", error); // Añadido para depuración
      return res.status(500).json({ error: "Error creando el comentario" });
    }
  }
  

  public async getComments(req: Request, res: Response) {
    const { submission_id } = req.params;

    try {
      // Verificar si el submission_id es válido
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
