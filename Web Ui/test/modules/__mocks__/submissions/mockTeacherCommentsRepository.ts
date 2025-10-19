import { CommentsCreationObject, CommentDataObject } from "../../../../src/modules/teacherCommentsOnSubmissions/domain/CommentsInterface";
import TeacherCommentsRepositoryInterface from "../../../../src/modules/teacherCommentsOnSubmissions/domain/CommentsRepositoryInterface";

export class MockTeacherCommentsRepository implements TeacherCommentsRepositoryInterface {
  private readonly comments: CommentDataObject[] = []; 

  getCommentsBySubmissionId = jest.fn(async (submissionId: number): Promise<CommentDataObject[]> => {
    return this.comments.filter(comment => comment.submission_id === submissionId);
  });

  createComment = jest.fn(async (commentData: CommentsCreationObject): Promise<CommentDataObject> => {
    const newComment: CommentDataObject = {
      ...commentData,
      id: this.comments.length + 1,       
      created_at: new Date(),             
    };
    this.comments.push(newComment);       
    return newComment;
  });
}