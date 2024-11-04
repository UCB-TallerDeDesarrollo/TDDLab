import { CommentsCreationObject } from "../domain/CommentsInterface";

export default interface TeacherCommentsRepositoryInterface {
  getCommentsBySubmissionId(submissionId: number): Promise<CommentsCreationObject[]>;
}

export default interface TeacherCommentsRepositoryInterface {
  getCommentsBySubmissionId(submissionId: number): Promise<CommentsCreationObject[]>;
  createComment(commentData: CommentsCreationObject): Promise<CommentsCreationObject>; // Agregar este método
}