import { CommentsCreationObject } from "../domain/CommentsInterface";
import TeacherCommentsRepositoryInterface from "../domain/CommentsRepositoryInterface";

export class GetCommentsBySubmissionId {
    constructor(
      private readonly commentsRepository: TeacherCommentsRepositoryInterface
    ) {}
  
    async getCommentsBySubmissionId(
      submissionId: number
    ): Promise<CommentsCreationObject[]> {
      return await this.commentsRepository.getCommentsBySubmissionId(submissionId);
    }
  }