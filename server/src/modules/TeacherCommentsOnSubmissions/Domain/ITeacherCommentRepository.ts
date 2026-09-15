import { TeacherComment } from "./TeacherComment";

export interface ITeacherCommentRepository {
  createTeacherComment(comment: Omit<TeacherComment, 'id' | 'created_at'>): Promise<TeacherComment>;
  getTeacherCommentsBySubmission(submission_id: number): Promise<TeacherComment[]>;
  isTeacher(teacher_id: number): Promise<boolean>;
  submissionExists(submission_id: number): Promise<boolean>;
}
