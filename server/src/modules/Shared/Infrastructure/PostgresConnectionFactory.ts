import { Pool, PoolClient } from "pg";
import { IDatabaseConnection, IDatabaseConnectionFactory } from "../Domain/IDatabaseConnectionFactory";
import config from "../../../config/db";


export class PostgresConnection implements IDatabaseConnection{
  constructor(private client: PoolClient) {

  }
  async query(query: string, values?: any[]): Promise<{ rows: any[] }> {
    return this.client.query(query, values);
  }
  release(): void {
    this.client.release();
  }
}

export class PostgresConnectionFactory implements IDatabaseConnectionFactory {
  private static instance: PostgresConnectionFactory;
  private pool:Pool;
  constructor() {
    this.pool = new Pool(config);
  }

  static getInstance(): PostgresConnectionFactory {
    if (!PostgresConnectionFactory.instance) {
      PostgresConnectionFactory.instance = new PostgresConnectionFactory();
    }
    return PostgresConnectionFactory.instance;
  }

  async getConnection(): Promise<PostgresConnection> {
    const client = await this.pool.connect();
    return new PostgresConnection(client);
  }
}
