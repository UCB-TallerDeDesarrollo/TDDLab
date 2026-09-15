import { FilterOperator } from "../../../../Shared/Domain/QueryBuilder/FilterOperator";
import { IQueryOptions } from "../../../../Shared/Domain/QueryBuilder/IQueryOptions";
import { QueryOptions } from "../../../../Shared/Domain/Schema/TableSchema";
import { PracticesFields } from "../Practices";

export class PracticesOptions extends QueryOptions<PracticesFields> {
  byId(id: string): PracticesOptions {
    this.filters.push({ field: PracticesFields.Id, operator: FilterOperator.Equals, value: id });
    return this;
  }

  byUserId(userId: number): PracticesOptions {
    this.filters.push({ field: PracticesFields.UserId, operator: FilterOperator.Equals, value: userId });
    return this;
  }

  byState(state: string): PracticesOptions {
    this.filters.push({ field: PracticesFields.State, operator: FilterOperator.Equals, value: state });
    return this;
  }

  orderByCreationDate(descending: boolean = true): PracticesOptions {
    this.orderBy = PracticesFields.CreationDate;
    this.orderDescending = descending;
    return this;
  }
}

export type PracticesQueryOptions = IQueryOptions<PracticesFields>;
