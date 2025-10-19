import { TeacherCommentRepository } from "../Repositories/TeacherCommentRepository";

export const getTeacherComments = async (
  submission_id: number,
  Adapter: TeacherCommentRepository = new TeacherCommentRepository()
) => {
  try {
    return await Adapter.getTeacherCommentsBySubmission(submission_id);
  } catch (error) {
    console.error("Error obtaining teacher comments:", error);
    return { error: "Error obtaining teacher comments" };
  }
};
