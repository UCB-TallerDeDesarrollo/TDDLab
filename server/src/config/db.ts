import dotenv from "dotenv"; // Import 'dotenv' as a module
dotenv.config();

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const isSecure = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

// DB CONFIG
const config = {
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: Number(PGPORT),
  ssl: isSecure
    ? { rejectUnauthorized: false }
    : false,
};

export default config;
