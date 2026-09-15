import { FilterOperator } from './FilterOperator';

export type FilterCondition<TFields extends string> = {
  field: TFields;
  operator: FilterOperator;
  value?: any;
  values?: any[];
};
