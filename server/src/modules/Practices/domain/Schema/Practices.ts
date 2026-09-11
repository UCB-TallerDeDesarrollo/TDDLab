import { TableSchema } from "../../../Shared/Domain/Schema/TableSchema";

export enum PracticesFields {
  Id = 'id',
  Title = 'title',
  Description = 'description',
  CreationDate = 'creation_date',
  State = 'state',
  UserId = 'userid',
}

export const PracticesSchema = new TableSchema(
  'practices',
  {
    [PracticesFields.Id]: 'id',
    [PracticesFields.Title]: 'title',
    [PracticesFields.Description]: 'description',
    [PracticesFields.CreationDate]: 'creation_date',
    [PracticesFields.State]: 'state',
    [PracticesFields.UserId]: 'userid',
  },
  PracticesFields
);
