import { FilterOperator } from "../../../../Shared/Domain/QueryBuilder/FilterOperator";
import { IQueryOptions } from "../../../../Shared/Domain/QueryBuilder/IQueryOptions";
import { QueryOptions } from "../../../../Shared/Domain/Schema/TableSchema";
import { GroupsFields } from "../Groups";

export class GroupsOptions extends QueryOptions<GroupsFields> {
  byId(id: number): GroupsOptions {
    this.filters.push({ field: GroupsFields.Id, operator: FilterOperator.Equals, value: id });
    return this;
  }

  byGroupName(groupName: string): GroupsOptions {
    this.filters.push({ field: GroupsFields.GroupName, operator: FilterOperator.Equals, value: groupName });
    return this;
  }

  byGroupDetail(groupDetail: string): GroupsOptions {
    this.filters.push({ field: GroupsFields.GroupDetail, operator: FilterOperator.Equals, value: groupDetail });
    return this;
  }

  orderByCreationDate(descending: boolean = true): GroupsOptions {
    this.orderBy = GroupsFields.CreationDate;
    this.orderDescending = descending;
    return this;
  }
}

export type GroupsQueryOptions = IQueryOptions<GroupsFields>;
