import express from "express";
import request from "supertest";
import { TDDIngestionController } from "../../../src/controllers/TDDCycles/TDDIngestionController";
import { TDDEventConflictError } from "../../../src/modules/TDDCycles/Domain/TDDEvents";

describe("TDD ingestion", () => {
  const repository = { saveEvents: jest.fn() };
  const token = "isolated-test-token";
  const run = {
    eventId: "11111111-1111-4111-8111-111111111111", branch: "feature/discount",
    numPassedTests: 0, failedTests: 1, numTotalTests: 1, timestamp: 1_790_000_000_000,
    success: false, coverage: 0,
  };
  const batch = { owner: "example", repoName: "exercise", executions: [run], commits: [] };

  function app(enabled = true) {
    const controller = new TDDIngestionController(repository, {
      enabled, token, repository: "example/exercise",
    });
    const server = express();
    server.use(express.json());
    server.post("/events", (req, res) => controller.save(req, res));
    return server;
  }

  beforeEach(() => repository.saveEvents.mockReset().mockResolvedValue(undefined));

  it("preserves zero passed tests and a failed execution", async () => {
    await request(app()).post("/events").set("Authorization", `Bearer ${token}`).send(batch).expect(200);
    expect(repository.saveEvents).toHaveBeenCalledWith(batch);
  });

  it("disables writes outside explicit database mode", async () => {
    await request(app(false)).post("/events").set("Authorization", `Bearer ${token}`).send(batch).expect(503);
    expect(repository.saveEvents).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated requests", async () => {
    await request(app()).post("/events").send(batch).expect(401);
    expect(repository.saveEvents).not.toHaveBeenCalled();
  });

  it("restricts the token to its configured repository", async () => {
    await request(app()).post("/events").set("Authorization", `Bearer ${token}`)
      .send({ ...batch, repoName: "another-exercise" }).expect(403);
    expect(repository.saveEvents).not.toHaveBeenCalled();
  });

  it.each([
    { ...run, numPassedTests: -1 },
    { ...run, numTotalTests: 0 },
    { ...run, success: true },
    { ...run, coverage: "unknown" },
    { ...run, eventId: "not-an-event-id" },
  ])("rejects malformed execution data", async (invalid) => {
    await request(app()).post("/events").set("Authorization", `Bearer ${token}`)
      .send({ ...batch, executions: [invalid] }).expect(400);
    expect(repository.saveEvents).not.toHaveBeenCalled();
  });

  it("reports conflicting commit associations", async () => {
    repository.saveEvents.mockRejectedValueOnce(new TDDEventConflictError("An execution already belongs to another commit"));
    await request(app()).post("/events").set("Authorization", `Bearer ${token}`).send(batch).expect(409);
  });
});
