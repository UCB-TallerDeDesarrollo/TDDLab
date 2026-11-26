import dotenv from "dotenv";

dotenv.config();

export const useFakeTDDRepository = process.env.TDD_USE_FAKE_REPOSITORY === "true";

export type TDDDataSource = "github" | "fake" | "db";

function readDataSource(): TDDDataSource {
  const source = process.env.TDD_DATA_SOURCE ?? (useFakeTDDRepository ? "fake" : "github");
  if (source === "github" || source === "fake" || source === "db") return source;
  throw new Error("TDD_DATA_SOURCE must be github, fake or db");
}

export const tddDataSource = readDataSource();
