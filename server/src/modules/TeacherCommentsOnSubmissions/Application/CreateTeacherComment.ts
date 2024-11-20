// En CreateTeacherComment.ts
import { TeacherCommentRepository } from "../Repositories/TeacherCommentRepository";

export const createTeacherComment = async (
  { submission_id, teacher_id, content }: { submission_id: number; teacher_id: number; content: string },
  repository: TeacherCommentRepository // Agregar el repositorio como segundo parámetro
) => {
  // Usa el repositorio aquí para crear el comentario
  const newComment = await repository.createTeacherComment({ submission_id, teacher_id, content });
  return newComment;
};
