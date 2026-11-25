import dotenv from "dotenv";
dotenv.config();

const { BRANCH_DATABASE_URL } = process.env;

if (!BRANCH_DATABASE_URL) {
  throw new Error("BRANCH_DATABASE_URL no está configurada en .env");
}

export const branchDbConfig = {
  connectionString: BRANCH_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
};
