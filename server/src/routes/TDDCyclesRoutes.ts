import express from "express";
import TDDIngestionRouter from "./TDDIngestionRoutes";
import { DBCommitsRepository } from "../modules/TDDCycles/Repositories/DBCommitsRepository";
import { DBJobsRepository } from "../modules/TDDCycles/Repositories/DBJobsRepository";
import { GithubRepository } from "../modules/TDDCycles/Repositories/GithubRepository";
import TDDCyclesController from "../controllers/TDDCycles/TDDCyclesController";
import { FakeRepository } from "../modules/TDDCycles/Repositories/FakeRepository";
import { VisualizeTDDRepository } from "../modules/TDDCycles/Repositories/VisualizeTDDRepository";
import { tddDataSource } from "../config/tdd";

// Create instances of repositories on demand
const dbCommitsRepository = new DBCommitsRepository();
const dbJobsRepository = new DBJobsRepository();
const githubRepository = new GithubRepository();

const visualizationRepository =
  tddDataSource === "fake"
    ? new FakeRepository()
    : tddDataSource === "github"
    ? githubRepository
    : new VisualizeTDDRepository();

// Create an instance of your controller
const tddCyclesController = new TDDCyclesController(
  dbCommitsRepository,
  dbJobsRepository,
  githubRepository,
  visualizationRepository
);

// Create a new router to handle the TDDCycles routes
const TDDCyclesRouter = express.Router();
TDDCyclesRouter.use("/events", TDDIngestionRouter);

TDDCyclesRouter.use(["/commits-history", "/commit-cycles", "/tdd-logs"], (_req, res, next) => {
  res.setHeader("X-TDD-Data-Source", tddDataSource);
  res.setHeader("Access-Control-Expose-Headers", "X-TDD-Data-Source");
  next();
});

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
  "/tdd-logs",
  async (req, res) => await tddCyclesController.getTDDLogs(req, res)
);

export default TDDCyclesRouter;
