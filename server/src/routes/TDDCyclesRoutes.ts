import express from "express";
import { DBCommitsRepository } from "../modules/TDDCycles/Repositories/DBCommitsRepository";
import { DBJobsRepository } from "../modules/TDDCycles/Repositories/DBJobsRepository";
import { GithubRepository } from "../modules/TDDCycles/Repositories/GithubRepository";
import TDDCyclesController from "../controllers/TDDCycles/TDDCyclesController";
import DBBranchesController from "../controllers/TDDCycles/DBBranchesController";
import { FirebaseDBBranchesCommitsRepository } from "../modules/TDDCycles/Repositories/FirebaseDBBranchesCommitsRepository";

// Create instances of your repositories
const dbCommitsRepository = new DBCommitsRepository();
const dbJobsRepository = new DBJobsRepository();
const githubRepository = new GithubRepository();
const firebaseDBBranchesCommitsRepository = new FirebaseDBBranchesCommitsRepository();

// Create an instance of your controller, now passing the firebase repository
const tddCyclesController = new TDDCyclesController(
  dbCommitsRepository,
  dbJobsRepository,
  githubRepository,
  firebaseDBBranchesCommitsRepository
);

const dbBranchesController = new DBBranchesController(firebaseDBBranchesCommitsRepository);

// Create a new router to handle the TDDCycles routes
const TDDCyclesRouter = express.Router();

// --- NEW ENDPOINTS ---
TDDCyclesRouter.post(
  "/commits",
  async (req, res) => await tddCyclesController.saveCommit(req, res)
);

TDDCyclesRouter.post(
  "/test-runs",
  async (req, res) => await tddCyclesController.saveTestRuns(req, res)
);
// ---------------------


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
  async (req, res) => await tddCyclesController.getCommitHistory(req, res)
);

TDDCyclesRouter.get(
  "/commit-cycles",
  async (req, res) => await tddCyclesController.getCommitCycles(req, res)
);

TDDCyclesRouter.get(
  "/branches",
  async (req, res) => await dbBranchesController.getCommitHistoryByBranches(req, res)
);

export default TDDCyclesRouter;
