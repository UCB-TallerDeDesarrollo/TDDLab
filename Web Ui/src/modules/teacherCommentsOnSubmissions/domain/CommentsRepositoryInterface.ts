import { CommentsCreationObject, CommentDataObject } from "../domain/CommentsInterface";

export default interface TeacherCommentsRepositoryInterface {
  getCommentsBySubmissionId(submissionId: number): Promise<CommentDataObject[]>;
  createComment(commentData: CommentsCreationObject): Promise<CommentDataObject>; 
}