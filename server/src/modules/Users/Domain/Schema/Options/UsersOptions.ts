import { FilterOperator } from "../../../../Shared/Domain/QueryBuilder/FilterOperator";
import { IQueryOptions } from "../../../../Shared/Domain/QueryBuilder/IQueryOptions";
import { QueryOptions } from "../../../../Shared/Domain/Schema/TableSchema";
import { UsersFields } from "../Users";

export class UsersOptions extends QueryOptions<UsersFields> {
  byId(id: number): UsersOptions {
    this.filters.push({ field: UsersFields.Id, operator: FilterOperator.Equals, value: id });
    return this;
  }

  byEmail(email: string): UsersOptions {
    this.filters.push({ field: UsersFields.Email, operator: FilterOperator.Equals, value: email });
    return this;
  }

  byGroupId(groupId: number): UsersOptions {
    this.filters.push({ field: UsersFields.GroupId, operator: FilterOperator.Equals, value: groupId });
    return this;
  }

  byRole(role: string): UsersOptions {
    this.filters.push({ field: UsersFields.Role, operator: FilterOperator.Equals, value: role });
    return this;
  }
}

export type UsersQueryOptions = IQueryOptions<UsersFields>;
