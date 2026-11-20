import express from "express";
import request from "supertest";
import { parseTDDLogs } from "../../src/modules/TDDCycles/Domain/parseTDDLogs";

const mockHistory = jest.fn();
const mockCycles = jest.fn();
const mockLogs = jest.fn();

jest.mock("../../src/modules/TDDCycles/Repositories/DBCommitsRepository", () => ({
  DBCommitsRepository: jest.fn().mockImplementation(() => ({})),
}));
jest.mock("../../src/modules/TDDCycles/Repositories/DBJobsRepository", () => ({
  DBJobsRepository: jest.fn().mockImplementation(() => ({})),
}));
jest.mock("../../src/modules/TDDCycles/Repositories/VisualizeTDDRepository", () => ({
  VisualizeTDDRepository: jest.fn().mockImplementation(() => ({
    getCommitHistoryData: jest.fn(),
    getCommitCyclesData: jest.fn(),
    getTDDLogs: jest.fn(),
  })),
}));
jest.mock("../../src/modules/TDDCycles/Repositories/GithubRepository", () => ({
  GithubRepository: jest.fn().mockImplementation(() => ({
    getCommitHistoryData: mockHistory,
    getCommitCyclesData: mockCycles,
    getTDDLogs: mockLogs,
  })),
}));

function createApp(mode?: string) {
  const previousFake = process.env.TDD_USE_FAKE_REPOSITORY;
  const previousSource = process.env.TDD_DATA_SOURCE;
  if (mode === undefined) {
    delete process.env.TDD_USE_FAKE_REPOSITORY;
    delete process.env.TDD_DATA_SOURCE;
  } else if (mode === "true") {
    process.env.TDD_USE_FAKE_REPOSITORY = "true";
    process.env.TDD_DATA_SOURCE = "fake";
  } else {
    process.env.TDD_USE_FAKE_REPOSITORY = "false";
    process.env.TDD_DATA_SOURCE = "github";
  }
  const app = express();
  try {
    jest.isolateModules(() => {
      const routes: typeof import("../../src/routes/TDDCyclesRoutes") = require("../../src/routes/TDDCyclesRoutes");
      app.use("/api/TDDCycles", routes.default);
    });
  } finally {
    if (previousFake === undefined) delete process.env.TDD_USE_FAKE_REPOSITORY;
    else process.env.TDD_USE_FAKE_REPOSITORY = previousFake;
    if (previousSource === undefined) delete process.env.TDD_DATA_SOURCE;
    else process.env.TDD_DATA_SOURCE = previousSource;
  }
  return app;
}

describe("TDD visualization API repository selection", () => {
  const query = { owner: "tddlab-demo", repoName: "branches" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("serves the complete fake dataset through the real routes and use cases", async () => {
    const app = createApp("true");
    const commits = await request(app).get("/api/TDDCycles/commits-history").query(query).expect(200);
    const cycles = await request(app).get("/api/TDDCycles/commit-cycles").query(query).expect(200);
    const logs = await request(app).get("/api/TDDCycles/tdd-logs").query(query).expect(200);

    expect(commits.headers["x-tdd-data-source"]).toBe("fake");
    expect(commits.headers["access-control-expose-headers"]).toBe("X-TDD-Data-Source");
    expect(commits.body).toHaveLength(3);
    expect(commits.body[0].commit.date).toBe("2026-11-12T14:03:00.000Z");
    expect(cycles.body).toHaveLength(3);
    expect(parseTDDLogs(logs.body)).toHaveLength(6);
    expect(logs.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ numPassedTests: 0, success: false }),
      expect.objectContaining({ gitGraph: expect.arrayContaining([expect.objectContaining({ parents: [] })]) }),
    ]));
    expect(mockHistory).not.toHaveBeenCalled();
    expect(mockCycles).not.toHaveBeenCalled();
    expect(mockLogs).not.toHaveBeenCalled();
  });

  it.each(["commits-history", "commit-cycles", "tdd-logs"])("returns an empty %s dataset for an unknown repository", async (path) => {
    const response = await request(createApp("true")).get(`/api/TDDCycles/${path}`)
      .query({ owner: "student", repoName: "real-project" }).expect(200);
    expect(response.body).toEqual([]);
  });

  it.each(["commits-history", "commit-cycles", "tdd-logs"])("validates the repository parameters for %s", async (path) => {
    const app = createApp("true");
    await request(app).get(`/api/TDDCycles/${path}`).expect(400);
    await request(app).get(`/api/TDDCycles/${path}`).query({ owner: "../student", repoName: "repo" }).expect(400);
  });

  it("keeps the real adapter selected when fake mode is not enabled", async () => {
    mockHistory.mockResolvedValueOnce([{ sha: "real-adapter-result" }]);
    const response = await request(createApp("false")).get("/api/TDDCycles/commits-history").query(query).expect(200);
    expect(response.headers["x-tdd-data-source"]).toBe("github");
    expect(response.body).toEqual([{ sha: "real-adapter-result" }]);
    expect(mockHistory).toHaveBeenCalledWith(query.owner, query.repoName);
  });

  it("reports a repository failure instead of falling back to fake data", async () => {
    mockLogs.mockRejectedValueOnce(new Error("Source unavailable"));
    const response = await request(createApp("false")).get("/api/TDDCycles/tdd-logs").query(query).expect(500);
    expect(response.headers["x-tdd-data-source"]).toBe("github");
    expect(response.body).toEqual({ error: "Server error" });
  });
});
