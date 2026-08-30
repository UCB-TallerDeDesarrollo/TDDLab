// Solo datos, sin lógica SQL
import { FilterCondition } from '../QueryBuilder/FilterCondition';
import { FilterOperator } from '../QueryBuilder/FilterOperator';
import { IQueryOptions } from '../QueryBuilder/IQueryOptions';

export class TableSchema<TFields extends string> {
  constructor(
    public readonly tableName: string,
    public readonly fields: Record<TFields, string>,
    public readonly fieldEnum: Record<string, TFields>
  ) {}
}

// Opciones genéricas, sin SQL
export class QueryOptions<TFields extends string> implements IQueryOptions<TFields> {
  limit?: number;
  offset?: number;
  orderBy?: TFields;
  orderDescending?: boolean;
  selectedFields?: TFields[];
  filters: FilterCondition<TFields>[] = [];

  constructor(
    filters: FilterCondition<TFields>[] = [],
    limit?: number,
    offset?: number,
    orderBy?: TFields,
    orderDescending?: boolean,
    selectedFields?: TFields[]
  ) {
    this.filters = filters;
    this.limit = limit;
    this.offset = offset;
    this.orderBy = orderBy;
    this.orderDescending = orderDescending || false;
    this.selectedFields = selectedFields;
  }

  addFilter(field: TFields, operator: FilterOperator, value?: any): IQueryOptions<TFields> {
    this.filters.push({ field, operator, value });
    return this;
  }
}
