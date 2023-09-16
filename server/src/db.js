require("dotenv").config();
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } = process.env;

// Database configuration
const dbConfig = {
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: PGPORT,
};
