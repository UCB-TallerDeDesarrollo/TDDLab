import express from "express";
import { DBCommitsRepository } from "../modules/TDDCycles/Repositories/DBCommitsRepository";
import TDDCyclesController from "../controllers/TDDCycles/TDDCyclesController";
import { BranchTrackingController } from "../controllers/TDDCycles/BranchTrackingController";
import { createTDDCyclesDependencies } from "../modules/TDDCycles/Repositories/createTDDCyclesDependencies";

// Create instances of your repositories
const dbCommitsRepository = new DBCommitsRepository();
const { dbJobsRepository, githubRepository, registrationRepository } = createTDDCyclesDependencies();

// Create an instance of your controller
const tddCyclesController = new TDDCyclesController(
  dbCommitsRepository,
  dbJobsRepository,
  githubRepository,
  registrationRepository
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

TDDCyclesRouter.post(
  "/jobs",
  async (req, res) => await tddCyclesController.registerTestResult(req, res)
);
const branchTrackingController = new BranchTrackingController();

TDDCyclesRouter.get("/visualization", async (req, res) => await branchTrackingController.visualization(req, res));

TDDCyclesRouter.post(
  "/ingest-logs",
  async (req, res) => await branchTrackingController.ingest(req, res)
);
TDDCyclesRouter.post(
  "/branch-tracking/ingest",
  async (req, res) => await branchTrackingController.ingest(req, res)
);

TDDCyclesRouter.post(
  "/upload-log",
  async (req, res) => await tddCyclesController.uploadTDDLog(req, res)
);

TDDCyclesRouter.get( //en teoria aqui deberia recibir el sha del commit
  "/commit-timeline",
  async (req, res) => await tddCyclesController.getCommitTimeLine(req, res)
);

//Ruta para obtener los commits de un repositorio de la BD
TDDCyclesRouter.get(
  "/get-commits",
  async (req, res) => await tddCyclesController.getCommits(req, res)
);

// New endpoints moved from frontend logic
TDDCyclesRouter.get(
  "/commits-history",
  async (req, res) => await branchTrackingController.commitHistory(req, res)
);

TDDCyclesRouter.get(
  "/commit-cycles",
  async (req, res) => await branchTrackingController.commitCycles(req, res)
);

TDDCyclesRouter.get(
  "/branches",
  async (req, res) => await branchTrackingController.branches(req, res)
);

TDDCyclesRouter.get(
  "/branch-snapshot",
  async (req, res) => await tddCyclesController.getBranchSnapshot(req, res)
);

TDDCyclesRouter.get("/test-log", async (req, res) => await branchTrackingController.testLog(req, res));

export default TDDCyclesRouter;
