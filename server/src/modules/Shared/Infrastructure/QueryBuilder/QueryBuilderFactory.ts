import { IQueryBuilderFactory } from '../../Domain/QueryBuilder/IQueryBuilderFactory';
import { IQueryBuilder } from '../../Domain/QueryBuilder/IQueryBuilder';
import { PostgresQueryBuilder } from './PostgresQueryBuilder';
import { TableSchema } from '../../Domain/Schema/TableSchema';


export class QueryBuilderFactory implements IQueryBuilderFactory {
  create<TFields extends string>(schema: TableSchema<TFields>): IQueryBuilder<TFields> {
    return new PostgresQueryBuilder(
      (field) => schema.fields[field],
      schema.tableName
    );
  }
}

export const queryBuilderFactory = new QueryBuilderFactory();
