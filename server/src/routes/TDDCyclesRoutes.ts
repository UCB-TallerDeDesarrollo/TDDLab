import express from "express";
import TDDCyclesController from "../controllers/TDDCycles/TDDCyclesController";
import { CommitRepository } from "../modules/Commits/Repositories/commitRepository";
import { JobRepository } from "../modules/Jobs/Repositories/jobRepository";

const commitsRepository = new CommitRepository(); // Create an instance of your repository
const jobRepository = new JobRepository();

const tddCyclesController = new TDDCyclesController(
  commitsRepository,
  jobRepository
); // Pass the repository instance to the controller

const TDDCyclesRouter = express.Router();

TDDCyclesRouter.get(
  "/commits",
  async (req, res) => await tddCyclesController.getCommits(req, res)
);

TDDCyclesRouter.get(
  "/jobs",
  async (req, res) => await tddCyclesController.getJobs(req, res)
);

export default TDDCyclesRouter;
