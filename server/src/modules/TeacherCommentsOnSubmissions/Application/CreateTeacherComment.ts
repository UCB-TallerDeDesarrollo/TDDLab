
import { TeacherCommentRepository } from "..//Repositories/TeacherCommentRepository";

export const createTeacherComment = async (
  { submission_id, teacher_id, content }: { submission_id: number; teacher_id: number; content: string },
  repository: TeacherCommentRepository // Agregar el repositorio como segundo parámetro
) => {
  const newComment = await repository.createTeacherComment({ submission_id, teacher_id, content });
  return newComment;
};