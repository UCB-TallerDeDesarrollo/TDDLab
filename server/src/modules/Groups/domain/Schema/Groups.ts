import { TableSchema } from "../../../Shared/Domain/Schema/TableSchema";

export enum GroupsFields {
  Id = 'id',
  GroupName = 'groupname',
  GroupDetail = 'groupdetail',
  CreationDate = 'creationdate',
}

export const GroupsSchema = new TableSchema(
  'Groups',
  {
    [GroupsFields.Id]: 'id',
    [GroupsFields.GroupName]: 'groupname',
    [GroupsFields.GroupDetail]: 'groupdetail',
    [GroupsFields.CreationDate]: 'creationdate',
  },
  GroupsFields
);
