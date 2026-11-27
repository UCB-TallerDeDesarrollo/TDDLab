import dotenv from "dotenv";

dotenv.config();

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

// Database used by the existing application features.
const config = {
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: Number(PGPORT),
  ssl: {
    rejectUnauthorized: false,
  },
};

export default config;
