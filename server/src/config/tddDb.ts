import dotenv from "dotenv";

dotenv.config();

const tddConfig = {
  connectionString: process.env.TDDLAB_DATABASE_URL || process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  ssl: process.env.TDDLAB_DATABASE_SSL === "false" ? false : {
    rejectUnauthorized: false,
  },
};

export default tddConfig;
