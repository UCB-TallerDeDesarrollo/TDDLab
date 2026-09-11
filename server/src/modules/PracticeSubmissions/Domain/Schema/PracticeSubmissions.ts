import { TableSchema } from "../../../Shared/Domain/Schema/TableSchema";

export enum PracticeSubmissionsFields {
  Id = 'id',
  PracticeId = 'practiceid',
  UserId = 'userid',
  Status = 'status',
  RepositoryLink = 'repository_link',
  StartDate = 'start_date',
  EndDate = 'end_date',
  Comment = 'comment',
}

export const PracticeSubmissionsSchema = new TableSchema(
  'practicesubmissions',
  {
    [PracticeSubmissionsFields.Id]: 'id',
    [PracticeSubmissionsFields.PracticeId]: 'practiceid',
    [PracticeSubmissionsFields.UserId]: 'userid',
    [PracticeSubmissionsFields.Status]: 'status',
    [PracticeSubmissionsFields.RepositoryLink]: 'repository_link',
    [PracticeSubmissionsFields.StartDate]: 'start_date',
    [PracticeSubmissionsFields.EndDate]: 'end_date',
    [PracticeSubmissionsFields.Comment]: 'comment',
  },
  PracticeSubmissionsFields
);
