import { IQueryBuilder } from '../../Domain/QueryBuilder/IQueryBuilder';
import { QueryResult } from '../../Domain/QueryBuilder/QueryResult';
import { FilterOperator } from '../../Domain/QueryBuilder/FilterOperator';
import { FilterCondition } from '../../Domain/QueryBuilder/FilterCondition';
import { IQueryOptions } from '../../Domain/QueryBuilder/IQueryOptions';

export class PostgresQueryBuilder<TFields extends string> implements IQueryBuilder<TFields> {
  private sql: string[] = [];
  private params: any[] = [];
  private paramIndex = 1;
  private hasWhere = false;

  constructor(
    private getColumnName: (field: TFields) => string,
    private tableName: string,
  ) {}

  select(fields?: TFields[]): IQueryBuilder<TFields> {
    if (!fields || fields.length === 0) {
      this.sql.push(`SELECT * FROM ${this.tableName}`);
    } else {
      const columns = fields.map(f => this.getColumnName(f)).join(', ');
      this.sql.push(`SELECT ${columns} FROM ${this.tableName}`);
    }
    return this;
  }

  insert(data: Record<string, any>): IQueryBuilder<TFields> {
    const columns = Object.keys(data);
    const placeholders = columns.map(() => `$${this.paramIndex++}`).join(', ');
    this.sql.push(`INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`);
    this.params.push(...Object.values(data));
    return this;
  }

  update(data: Record<string, any>): IQueryBuilder<TFields> {
    const setParts = Object.keys(data).map(key => {
      this.params.push(data[key]);
      return `${key} = $${this.paramIndex++}`;
    }).join(', ');
    this.sql.push(`UPDATE ${this.tableName} SET ${setParts}`);
    return this;
  }

  delete(): IQueryBuilder<TFields> {
    this.sql.push(`DELETE FROM ${this.tableName}`);
    return this;
  }

  where(options: IQueryOptions<TFields>): IQueryBuilder<TFields> {
    if (!options.filters || options.filters.length === 0) return this;
    this.appendWhere(options.filters, 'AND');
    return this;
  }

  orWhere(filters: FilterCondition<TFields>[]): IQueryBuilder<TFields> {
    if (!filters || filters.length === 0) return this;
    this.appendWhere(filters, 'OR');
    return this;
  }

  orderBy(field: TFields, descending: boolean = false): IQueryBuilder<TFields> {
    const direction = descending ? 'DESC' : 'ASC';
    this.sql.push(`ORDER BY ${this.getColumnName(field)} ${direction}`);
    return this;
  }

  limit(count: number): IQueryBuilder<TFields> {
    this.sql.push(`LIMIT $${this.paramIndex++}`);
    this.params.push(count);
    return this;
  }

  offset(count: number): IQueryBuilder<TFields> {
    this.sql.push(`OFFSET $${this.paramIndex++}`);
    this.params.push(count);
    return this;
  }

  returning(fields?: TFields[]): IQueryBuilder<TFields> {
    if (!fields || fields.length === 0) {
      this.sql.push('RETURNING *');
    } else {
      const columns = fields.map(f => this.getColumnName(f)).join(', ');
      this.sql.push(`RETURNING ${columns}`);
    }
    return this;
  }

  raw(query: string, params: any[] = []): IQueryBuilder<TFields> {
    this.sql = [query];
    this.params = params;
    this.paramIndex = params.length + 1;
    return this;
  }

  build(): QueryResult {
    return {
      query: this.sql.join(' '),
      params: [...this.params],
    };
  }

  private appendWhere(filters: FilterCondition<TFields>[], logic: 'AND' | 'OR'): void {
    if (!this.hasWhere) {
      this.sql.push('WHERE');
      this.hasWhere = true;
    } else {
      this.sql.push(logic);
    }

    const conditions: string[] = [];
    for (const cond of filters) {
      const column = this.getColumnName(cond.field);
      const rendered = this.renderCondition(cond, column);
      conditions.push(rendered);
    }

    this.sql.push(`(${conditions.join(` ${logic} `)})`);
  }

  private renderCondition(cond: FilterCondition<TFields>, column: string): string {
    const { operator, value, values } = cond;

    switch (operator) {
      case FilterOperator.Equals:
        this.params.push(value);
        return `${column} = $${this.paramIndex++}`;
      case FilterOperator.NotEquals:
        this.params.push(value);
        return `${column} <> $${this.paramIndex++}`;
      case FilterOperator.GreaterThan:
        this.params.push(value);
        return `${column} > $${this.paramIndex++}`;
      case FilterOperator.GreaterOrEqual:
        this.params.push(value);
        return `${column} >= $${this.paramIndex++}`;
      case FilterOperator.LessThan:
        this.params.push(value);
        return `${column} < $${this.paramIndex++}`;
      case FilterOperator.LessOrEqual:
        this.params.push(value);
        return `${column} <= $${this.paramIndex++}`;
      case FilterOperator.Contains:
        this.params.push(value);
        return `${column} LIKE '%' || $${this.paramIndex++} || '%'`;
      case FilterOperator.StartsWith:
        this.params.push(value);
        return `${column} LIKE $${this.paramIndex++} || '%'`;
      case FilterOperator.EndsWith:
        this.params.push(value);
        return `${column} LIKE '%' || $${this.paramIndex++}`;
      case FilterOperator.Like:
        this.params.push(value);
        return `${column} LIKE $${this.paramIndex++}`;
      case FilterOperator.ILike:
        this.params.push(value);
        return `${column} ILIKE $${this.paramIndex++}`;
      case FilterOperator.Between: {
        const arr = values || [value, value];
        this.params.push(arr[0], arr[1]);
        return `${column} BETWEEN $${this.paramIndex++} AND $${this.paramIndex++}`;
      }
      case FilterOperator.IsNull:
        return `${column} IS NULL`;
      case FilterOperator.IsNotNull:
        return `${column} IS NOT NULL`;
      case FilterOperator.In: {
        const vals = values || [];
        const placeholders = vals.map(() => `$${this.paramIndex++}`).join(', ');
        this.params.push(...vals);
        return `${column} IN (${placeholders})`;
      }
      default:
        this.params.push(value);
        return `${column} = $${this.paramIndex++}`;
    }
  }
}
