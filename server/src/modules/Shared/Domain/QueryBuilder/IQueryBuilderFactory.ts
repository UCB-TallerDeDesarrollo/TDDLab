import { IQueryBuilder } from './IQueryBuilder';
import { TableSchema } from '../Schema/TableSchema';

export interface IQueryBuilderFactory {
  create<TFields extends string>(schema: TableSchema<TFields>): IQueryBuilder<TFields>;
}
