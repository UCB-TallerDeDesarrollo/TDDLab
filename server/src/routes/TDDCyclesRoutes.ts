import express from "express";
import { DBCommitsRepository } from "../modules/TDDCycles/Repositories/DBCommitsRepository";
import { DBJobsRepository } from "../modules/TDDCycles/Repositories/DBJobsRepository";
import { GithubRepository } from "../modules/TDDCycles/Repositories/GithubRepository";
import TDDCyclesController from "../controllers/TDDCycles/TDDCyclesController";
import { InMemoryTDDHistoryRepository } from "../modules/TDDCycles/Repositories/InMemoryTDDHistoryRepository";
import type { BranchSyncData } from "../modules/TDDCycles/Application/BranchSyncData";

// Opt-in local mode. Production never loads development fixtures.
const mockEnabled = process.env.TDD_HISTORY_MOCK === "true" &&
  (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test");
const historyRepository = mockEnabled ? new InMemoryTDDHistoryRepository() : undefined;
let historyReady: Promise<void> | undefined;

async function seedHistory(): Promise<void> {
  if (!historyRepository) return;
  const scenario = process.env.TDD_HISTORY_MOCK_SCENARIO ?? "initial";
  if (scenario !== "initial" && scenario !== "after-merge") {
    throw new Error("TDD_HISTORY_MOCK_SCENARIO must be initial or after-merge");
  }
  // No Jest dependency: the fixture imports only types. Deferred loading works
  // in ts-node-dev and compiled CommonJS; it is never executed in production.
  const fixtures: typeof import("../../test/__mocks__/TDDCycles/dataTypeMocks/BranchSyncMock") =
    require("../../test/__mocks__/TDDCycles/dataTypeMocks/BranchSyncMock");
  const batches: BranchSyncData[] = [fixtures.mainSyncMock, fixtures.branchASyncMock, fixtures.branchBSyncMock];
  if (scenario === "after-merge") batches.push(fixtures.mainAfterMergeSyncMock);
  for (const fixture of batches) {
    await historyRepository.saveBatch({
      repository: fixture.repository,
      branches: [{ name: fixture.branch.name }],
      commits: fixture.commits,
      branchCommits: fixture.branchCommitShas.map(commitSha => ({ branchName: fixture.branch.name, commitSha })),
      executions: fixture.executions,
    });
  }
}

// Create instances of your repositories
const dbCommitsRepository = new DBCommitsRepository();
const dbJobsRepository = new DBJobsRepository();
const githubRepository = new GithubRepository();

// Create an instance of your controller
const tddCyclesController = new TDDCyclesController(
  dbCommitsRepository,
  dbJobsRepository,
  githubRepository,
  historyRepository
);

// Create a new router to handle the TDDCycles routes
const TDDCyclesRouter = express.Router();

TDDCyclesRouter.get("/branch-view", async (req, res) => {
  if (!mockEnabled) return res.status(503).json({ error: "Branch history is not enabled" });
  try {
    // Concurrent requests share one initialization per process.
    historyReady ??= seedHistory();
    await historyReady;
    return await tddCyclesController.getBranchHistory(req, res);
  } catch (error) {
    console.error("Error initializing branch history:", error);
    return res.status(500).json({ error: "Branch history initialization failed" });
  }
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

export default TDDCyclesRouter;
