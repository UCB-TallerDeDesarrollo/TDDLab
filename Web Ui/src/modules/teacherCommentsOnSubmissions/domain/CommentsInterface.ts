export interface CommentDataObject {
    id: number;
    submission_id: number;
    teacher_id: number;
    content: string;
    created_at: Date;
}

export interface CommentsCreationObject {
    submission_id: number;
    teacher_id: number;
    content: string;
  }