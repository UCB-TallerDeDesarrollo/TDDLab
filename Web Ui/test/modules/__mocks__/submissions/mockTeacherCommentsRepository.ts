import { CommentsCreationObject } from "../../../../src/modules/teacherCommentsOnSubmissions/domain/CommentsInterface";
import TeacherCommentsRepositoryInterface from "../../../../src/modules/teacherCommentsOnSubmissions/domain/CommentsRepositoryInterface";

export class MockTeacherCommentsRepository implements TeacherCommentsRepositoryInterface {
    private readonly comments: CommentsCreationObject[] = [];
  
    getCommentsBySubmissionId = jest.fn(async (submissionId: number) => {
      return this.comments.filter(comment => comment.submission_id === submissionId);
    });
  }