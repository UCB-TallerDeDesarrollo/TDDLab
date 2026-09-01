import { FilterOperator } from "../../../../Shared/Domain/QueryBuilder/FilterOperator";
import { IQueryOptions } from "../../../../Shared/Domain/QueryBuilder/IQueryOptions";
import { QueryOptions } from "../../../../Shared/Domain/Schema/TableSchema";
import { AssignmentsFields } from "../Assignments";

export class AssignmentsOptions extends QueryOptions<AssignmentsFields> {
  byId(id: string): AssignmentsOptions {
    this.filters.push({ field: AssignmentsFields.Id, operator: FilterOperator.Equals, value: id });
    return this;
  }

  byGroupId(groupId: number): AssignmentsOptions {
    this.filters.push({ field: AssignmentsFields.GroupId, operator: FilterOperator.Equals, value: groupId });
    return this;
  }

  byPracticeId(practiceId: string): AssignmentsOptions {
    this.filters.push({ field: AssignmentsFields.PracticeId, operator: FilterOperator.Equals, value: practiceId });
    return this;
  }

  byState(state: string): AssignmentsOptions {
    this.filters.push({ field: AssignmentsFields.State, operator: FilterOperator.Equals, value: state });
    return this;
  }

  withTitle(title: string): AssignmentsOptions {
    this.filters.push({ field: AssignmentsFields.Title, operator: FilterOperator.Equals, value: title });
    return this;
  }

  orderByStartDate(descending: boolean = true): AssignmentsOptions {
    this.orderBy = AssignmentsFields.StartDate;
    this.orderDescending = descending;
    return this;
  }

  orderByEndDate(descending: boolean = true): AssignmentsOptions {
    this.orderBy = AssignmentsFields.EndDate;
    this.orderDescending = descending;
    return this;
  }
}

export type AssignmentsQueryOptions = IQueryOptions<AssignmentsFields>;
