import dotenv from "dotenv";

dotenv.config();

export const useFakeTDDRepository = process.env.TDD_USE_FAKE_REPOSITORY === "true";
export const tddDataSource = process.env.TDD_DATA_SOURCE || (useFakeTDDRepository ? "fake" : "db");
