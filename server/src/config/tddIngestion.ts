import dotenv from "dotenv";

dotenv.config();

export const tddIngestionEnabled = process.env.TDD_INGESTION_ENABLED === "true";
export const tddIngestionToken = process.env.TDD_INGESTION_TOKEN;
export const tddIngestionRepository = process.env.TDD_INGESTION_REPOSITORY;
