import { QueryResult } from './QueryResult';
import { FilterCondition } from './FilterCondition';
import { IQueryOptions } from './IQueryOptions';

export interface IQueryBuilder<TFields extends string> {
  select(fields?: TFields[]): IQueryBuilder<TFields>;
  insert(data: Record<string, any>): IQueryBuilder<TFields>;
  update(data: Record<string, any>): IQueryBuilder<TFields>;
  delete(): IQueryBuilder<TFields>;
  where(options: IQueryOptions<TFields>): IQueryBuilder<TFields>;
  orWhere(filters: FilterCondition<TFields>[]): IQueryBuilder<TFields>;
  orderBy(field: TFields, descending?: boolean): IQueryBuilder<TFields>;
  limit(count: number): IQueryBuilder<TFields>;
  offset(count: number): IQueryBuilder<TFields>;
  returning(fields?: TFields[]): IQueryBuilder<TFields>;
  raw(query: string, params?: any[]): IQueryBuilder<TFields>;
  build(): QueryResult;
}
