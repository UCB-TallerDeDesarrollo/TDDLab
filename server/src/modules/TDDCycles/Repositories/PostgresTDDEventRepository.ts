import { Pool } from "pg";
import config from "../../../config/db";
import { ITDDIngestionRepository, TDDEventBatch } from "../Domain/TDDEvents";
import { TDDDatabasePool } from "./TDDDatabase";
import { storeTDDEvents } from "./storeTDDEvents";

export class PostgresTDDEventRepository implements ITDDIngestionRepository {
  private readonly pool: TDDDatabasePool;

  constructor(pool?: TDDDatabasePool) {
    this.pool = pool ?? new Pool(config);
  }

  async saveEvents(batch: TDDEventBatch): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await storeTDDEvents(client, batch);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
