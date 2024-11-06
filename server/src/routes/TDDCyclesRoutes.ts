import express from "express";
import { DBCommitsRepository } from "../modules/TDDCycles/Repositories/DBCommitsRepository";
import { DBJobsRepository } from "../modules/TDDCycles/Repositories/DBJobsRepository";
import { GithubRepository } from "../modules/TDDCycles/Repositories/GithubRepository";
import TDDCyclesController from "../controllers/TDDCycles/TDDCyclesController";

// Create instances of your repositories
const dbCommitsRepository = new DBCommitsRepository();
const dbJobsRepository = new DBJobsRepository();
const githubRepository = new GithubRepository();

// Create an instance of your controller
const tddCyclesController = new TDDCyclesController(
  dbCommitsRepository,
  dbJobsRepository,
  githubRepository
);

// Create a new router to handle the TDDCycles routes
const TDDCyclesRouter = express.Router();

// Get all commits from a repository in Github (TDD Cycles)
TDDCyclesRouter.get(
  "/commits",
  async (req, res) => await tddCyclesController.getTDDCycles(req, res)
);

// Get all test results from a repository in Github
TDDCyclesRouter.get(
  "/jobs",
  async (req, res) => await tddCyclesController.getTestResults(req, res)
);

// Ruta para subir el archivo TDD log
TDDCyclesRouter.post(
  "/upload-log",
  async (req, res) => await tddCyclesController.uploadTDDLog(req, res)
);

export default TDDCyclesRouter;
