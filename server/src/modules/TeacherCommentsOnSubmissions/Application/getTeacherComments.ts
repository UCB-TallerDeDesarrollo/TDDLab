import { ITeacherCommentRepository } from "../Domain/ITeacherCommentRepository";

export const getTeacherComments = async (
  submission_id: number,
  repository: ITeacherCommentRepository
) => {
  try {
    return await repository.getTeacherCommentsBySubmission(submission_id);
  } catch (error) {
    console.error("Error obtaining teacher comments:", error);
    return { error: "Error obtaining teacher comments" };
  }
};
