import express from "express";
import { TDDIngestionController } from "../controllers/TDDCycles/TDDIngestionController";
import { PostgresTDDEventRepository } from "../modules/TDDCycles/Repositories/PostgresTDDEventRepository";
import { tddIngestionEnabled, tddIngestionToken, tddIngestionRepository } from "../config/tddIngestion";

const controller = new TDDIngestionController(new PostgresTDDEventRepository(), {
  enabled: tddIngestionEnabled,
  token: tddIngestionToken,
  repository: tddIngestionRepository,
});
const router = express.Router();
router.post("/", (req, res) => controller.save(req, res));

export default router;
