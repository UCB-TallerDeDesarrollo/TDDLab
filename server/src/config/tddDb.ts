import dotenv from "dotenv";
import { Pool } from "pg";

let pool: Pool | undefined;

export function getTddPool(): Pool {
  if (!pool) {
    dotenv.config();
    const connectionString = process.env.TDD_DATABASE_URL?.trim();
    if (!connectionString) {
      throw new Error("TDD_DATABASE_URL is required for TDD history");
    }

    pool = new Pool({ connectionString, connectionTimeoutMillis: 8000 });
    pool.on("error", (error) => {
      console.error("TDD history database idle client error", error.name);
    });
  }

  return pool;
}
