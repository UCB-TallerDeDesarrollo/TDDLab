import { TableSchema } from "../../../Shared/Domain/Schema/TableSchema";

export enum SubmissionsFields {
  Id = 'id',
  AssignmentId = 'assignmentid',
  UserId = 'userid',
  Status = 'status',
  RepositoryLink = 'repository_link',
  StartDate = 'start_date',
  EndDate = 'end_date',
  Comment = 'comment',
}

export const SubmissionsSchema = new TableSchema(
  'submissions',
  {
    [SubmissionsFields.Id]: 'id',
    [SubmissionsFields.AssignmentId]: 'assignmentid',
    [SubmissionsFields.UserId]: 'userid',
    [SubmissionsFields.Status]: 'status',
    [SubmissionsFields.RepositoryLink]: 'repository_link',
    [SubmissionsFields.StartDate]: 'start_date',
    [SubmissionsFields.EndDate]: 'end_date',
    [SubmissionsFields.Comment]: 'comment',
  },
  SubmissionsFields
);
