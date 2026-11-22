import { PoolClient } from "pg";

export type TDDDatabaseClient = Pick<PoolClient, "query" | "release">;
export interface TDDDatabasePool {
  connect(): Promise<TDDDatabaseClient>;
}
