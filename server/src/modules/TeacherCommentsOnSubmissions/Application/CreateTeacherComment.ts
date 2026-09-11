import { ITeacherCommentRepository } from "../Domain/ITeacherCommentRepository";

export const createTeacherComment = async (
  { submission_id, teacher_id, content }: { submission_id: number; teacher_id: number; content: string },
  repository: ITeacherCommentRepository
) => {
  const newComment = await repository.createTeacherComment({ submission_id, teacher_id, content });
  return newComment;
};
