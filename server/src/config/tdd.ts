import dotenv from "dotenv";

dotenv.config();

export const useFakeTDDRepository = process.env.TDD_USE_FAKE_REPOSITORY === "true";
