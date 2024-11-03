import { CommentsCreationObject } from "../domain/CommentsInterface";

export default interface TeacherCommentsRepositoryInterface {
  getCommentsBySubmissionId(submissionId: number): Promise<CommentsCreationObject[]>;
}
