import { FilterOperator } from "../../../../Shared/Domain/QueryBuilder/FilterOperator";
import { IQueryOptions } from "../../../../Shared/Domain/QueryBuilder/IQueryOptions";
import { QueryOptions } from "../../../../Shared/Domain/Schema/TableSchema";
import { SubmissionsFields } from "../Submissions";

export class SubmissionsOptions extends QueryOptions<SubmissionsFields> {
  byId(id: number): SubmissionsOptions {
    this.filters.push({ field: SubmissionsFields.Id, operator: FilterOperator.Equals, value: id });
    return this;
  }

  byAssignmentId(assignmentId: number): SubmissionsOptions {
    this.filters.push({ field: SubmissionsFields.AssignmentId, operator: FilterOperator.Equals, value: assignmentId });
    return this;
  }

  byUserId(userId: number): SubmissionsOptions {
    this.filters.push({ field: SubmissionsFields.UserId, operator: FilterOperator.Equals, value: userId });
    return this;
  }

  byStatus(status: string): SubmissionsOptions {
    this.filters.push({ field: SubmissionsFields.Status, operator: FilterOperator.Equals, value: status });
    return this;
  }

  withRepositoryLink(repositoryLink: string): SubmissionsOptions {
    this.filters.push({ field: SubmissionsFields.RepositoryLink, operator: FilterOperator.Equals, value: repositoryLink });
    return this;
  }

  orderByStartDate(descending: boolean = true): SubmissionsOptions {
    this.orderBy = SubmissionsFields.StartDate;
    this.orderDescending = descending;
    return this;
  }

  orderByEndDate(descending: boolean = true): SubmissionsOptions {
    this.orderBy = SubmissionsFields.EndDate;
    this.orderDescending = descending;
    return this;
  }
}

export type SubmissionsQueryOptions = IQueryOptions<SubmissionsFields>;
