import { TableSchema } from "./TableSchema";

export enum TeacherCommentsFields {
  Id = 'id',
  SubmissionId = 'submission_id',
  TeacherId = 'teacher_id',
  Content = 'content',
  CreatedAt = 'created_at',
}

export const TeacherCommentsSchema = new TableSchema(
  'TeacherComments',
  {
    [TeacherCommentsFields.Id]: 'id',
    [TeacherCommentsFields.SubmissionId]: 'submission_id',
    [TeacherCommentsFields.TeacherId]: 'teacher_id',
    [TeacherCommentsFields.Content]: 'content',
    [TeacherCommentsFields.CreatedAt]: 'created_at',
  },
  TeacherCommentsFields
);
