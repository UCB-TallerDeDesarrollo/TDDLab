import { TableSchema } from "../../../Shared/Domain/Schema/TableSchema";

export enum UsersFields {
  Id = 'id',
  Email = 'email',
  GroupId = 'groupid',
  Role = 'role',
}

export const UsersSchema = new TableSchema(
  'userstable',
  {
    [UsersFields.Id]: 'id',
    [UsersFields.Email]: 'email',
    [UsersFields.GroupId]: 'groupid',
    [UsersFields.Role]: 'role',
  },
  UsersFields
);
