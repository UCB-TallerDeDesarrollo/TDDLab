import express from "express";
import axios from "axios";
import { DBCommitsRepository } from "../modules/TDDCycles/Repositories/DBCommitsRepository";
import TDDCyclesController from "../controllers/TDDCycles/TDDCyclesController";
import { createTDDCyclesDependencies } from "../modules/TDDCycles/Repositories/createTDDCyclesDependencies";
import { isValidBranch } from "../modules/TDDCycles/Domain/RepositoryRef";

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
  async (req, res) => await tddCyclesController.getBranches(req, res)
);

TDDCyclesRouter.get(
  "/branch-snapshot",
  async (req, res) => await tddCyclesController.getBranchSnapshot(req, res)
);

TDDCyclesRouter.get("/test-log", async (req, res) => {
  const { owner, repoName, branch = "main" } = req.query;
  if (typeof owner !== "string" || !/^[\w-]+$/.test(owner) ||
      typeof repoName !== "string" || !/^[\w.-]+$/.test(repoName) ||
      repoName === "." || repoName === ".." || !isValidBranch(branch)) {
    return res.status(400).json({ error: "Invalid owner or repoName" });
  }

  try {
    const encodedOwner = encodeURIComponent(owner);
    const encodedRepoName = encodeURIComponent(repoName);
    const encodedBranch = branch.split("/").map(encodeURIComponent).join("/");
    const url = `https://raw.githubusercontent.com/${encodedOwner}/${encodedRepoName}/${encodedBranch}/script/tdd_log.json`;
    const { data } = await axios.get<unknown>(url, { timeout: 5000 });
    if (!Array.isArray(data)) {
      return res.status(502).json({ error: "Invalid TDD test log" });
    }
    return res.json(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return res.json([]);
    }
    return res.status(502).json({ error: "Could not load the TDD test log" });
  }
});

export default TDDCyclesRouter;
