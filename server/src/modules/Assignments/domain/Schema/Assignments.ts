import { TableSchema } from "../../../Shared/Domain/Schema/TableSchema";

export enum AssignmentsFields {
  Id = 'id',
  Title = 'title',
  Description = 'description',
  StartDate = 'start_date',
  EndDate = 'end_date',
  State = 'state',
  Link = 'link',
  Comment = 'comment',
  GroupId = 'groupid',
  PracticeId = 'practice_id',
}

export const AssignmentsSchema = new TableSchema(
  'assignments',
  {
    [AssignmentsFields.Id]: 'id',
    [AssignmentsFields.Title]: 'title',
    [AssignmentsFields.Description]: 'description',
    [AssignmentsFields.StartDate]: 'start_date',
    [AssignmentsFields.EndDate]: 'end_date',
    [AssignmentsFields.State]: 'state',
    [AssignmentsFields.Link]: 'link',
    [AssignmentsFields.Comment]: 'comment',
    [AssignmentsFields.GroupId]: 'groupid',
    [AssignmentsFields.PracticeId]: 'practice_id',
  },
  AssignmentsFields
);
