import { FilterOperator } from "../../../../Shared/Domain/QueryBuilder/FilterOperator";
import { IQueryOptions } from "../../../../Shared/Domain/QueryBuilder/IQueryOptions";
import { QueryOptions } from "../../../../Shared/Domain/Schema/TableSchema";
import { PracticeSubmissionsFields } from "../../PracticeSubmission";

export class PracticeSubmissionsOptions extends QueryOptions<PracticeSubmissionsFields> {
  byId(id: number): PracticeSubmissionsOptions {
    this.filters.push({ field: PracticeSubmissionsFields.Id, operator: FilterOperator.Equals, value: id });
    return this;
  }

  byPracticeId(practiceId: number): PracticeSubmissionsOptions {
    this.filters.push({ field: PracticeSubmissionsFields.PracticeId, operator: FilterOperator.Equals, value: practiceId });
    return this;
  }

  byUserId(userId: number): PracticeSubmissionsOptions {
    this.filters.push({ field: PracticeSubmissionsFields.UserId, operator: FilterOperator.Equals, value: userId });
    return this;
  }

  byStatus(status: string): PracticeSubmissionsOptions {
    this.filters.push({ field: PracticeSubmissionsFields.Status, operator: FilterOperator.Equals, value: status });
    return this;
  }

  orderByStartDate(descending: boolean = true): PracticeSubmissionsOptions {
    this.orderBy = PracticeSubmissionsFields.StartDate;
    this.orderDescending = descending;
    return this;
  }

  orderByEndDate(descending: boolean = true): PracticeSubmissionsOptions {
    this.orderBy = PracticeSubmissionsFields.EndDate;
    this.orderDescending = descending;
    return this;
  }
}

export type PracticeSubmissionsQueryOptions = IQueryOptions<PracticeSubmissionsFields>;
