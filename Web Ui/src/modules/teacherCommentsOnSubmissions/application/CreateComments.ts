import { CommentsCreationObject } from "../domain/CommentsInterface";
import TeacherCommentsRepositoryInterface from "../domain/CommentsRepositoryInterface";

export class CreateComments {
  constructor(
    private readonly commentsRepository: TeacherCommentsRepositoryInterface
  ) {}

  async createComment(commentData: CommentsCreationObject) {
    return await this.commentsRepository.createComment(commentData);
  }
}