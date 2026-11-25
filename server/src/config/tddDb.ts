import dotenv from "dotenv";

dotenv.config();

const tddConfig = {
  connectionString: process.env.TDDLAB_DATABASE_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
};

export default tddConfig;
