import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";
import defaultConfig from "./db";

dotenv.config();

const connectionString =
  process.env.BRANCH_SUPPORT_DATABASE_URL || process.env.DATABASE_URL;

let poolConfig: PoolConfig;

if (connectionString) {
  poolConfig = {
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  };
} else {
  poolConfig = { ...defaultConfig };
}

export const branchSupportPool = new Pool(poolConfig);

export default branchSupportPool;
