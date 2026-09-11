import { FilterCondition } from './FilterCondition';
import { FilterOperator } from './FilterOperator';

export interface IQueryOptions<TFields extends string> {
  limit?: number;
  offset?: number;
  orderBy?: TFields;
  orderDescending?: boolean;
  selectedFields?: TFields[];
  filters: FilterCondition<TFields>[];

  addFilter(field: TFields, operator: FilterOperator, value?: any): IQueryOptions<TFields>;
}
