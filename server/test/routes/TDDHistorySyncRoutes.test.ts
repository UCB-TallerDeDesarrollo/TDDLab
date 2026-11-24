import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { Pool } from "pg";
import { createTDDHistorySyncRouter } from "../../src/routes/TDDHistorySyncRoutes";
import * as tddDb from "../../src/config/tddDb";
import { PostgresTDDHistoryRepository } from "../../src/modules/TDDCycles/Repositories/PostgresTDDHistoryRepository";
import { InMemoryTDDHistoryRepository } from "../../src/modules/TDDCycles/Repositories/InMemoryTDDHistoryRepository";
import {
  mainSyncMock,
  branchASyncMock,
} from "../__mocks__/TDDCycles/dataTypeMocks/BranchSyncMock";

const token = "a".repeat(64);
const credentials = JSON.stringify([
  { token, repository: mainSyncMock.repository },
]);

function setup(configuration: string | undefined = credentials) {
  const repository = new InMemoryTDDHistoryRepository();
  const save = jest.spyOn(repository, "saveBatch");
  const app = express();
  app.use(
    "/api/TDDCycles",
    createTDDHistorySyncRouter({
      repository,
      credentials: () => configuration,
    }),
  );
  return { app, repository, save };
}

describe("POST /api/TDDCycles/sync/credentials", () => {
  const sessionSecret = "test-session-signing-secret";
  const syncUrl = "https://tddlab.example/api/TDDCycles/sync";
  const path = "/api/TDDCycles/sync/credentials";
  const repository = mainSyncMock.repository;

  beforeEach(() => {
    jest.replaceProperty(process, "env", {
      ...process.env, JWT_SECRET: sessionSecret, TDD_SYNC_URL: syncUrl,
    });
  });

  afterEach(() => jest.restoreAllMocks());

  function session(id: number): string {
    return "userSession=" + jwt.sign({ id, role: "student" }, sessionSecret, { expiresIn: "5m" });
  }

  it("delivers only an explicitly assigned repository token and can use it to sync", async () => {
    const { app } = setup(JSON.stringify([{ token, repository, userIds: [23] }]));
    const response = await request(app).post(path).set("Cookie", session(23))
      .send({ repository }).expect("Cache-Control", "no-store").expect(200);
    expect(response.body).toEqual({ TDD_SYNC_URL: syncUrl, TDD_SYNC_TOKEN: token });
    await request(app).post("/api/TDDCycles/sync")
      .auth(response.body.TDD_SYNC_TOKEN, { type: "bearer" }).send(mainSyncMock).expect(200);
  });

  it("requires a valid session and denies unassigned users, repositories and legacy credentials", async () => {
    const { app } = setup(JSON.stringify([{ token, repository, userIds: [23] }]));
    await request(app).post(path).send({ repository }).expect(401);
    await request(app).post(path).set("Cookie", "userSession=invalid").send({ repository }).expect(401);
    await request(app).post(path).set("Cookie", session(24)).send({ repository }).expect(403);
    await request(app).post(path).set("Cookie", session(23))
      .send({ repository: { ...repository, name: "another-repo" } }).expect(403);
    await request(setup().app).post(path).set("Cookie", session(23)).send({ repository }).expect(403);
  });

  it("rejects insecure endpoint configuration without returning the token", async () => {
    process.env.TDD_SYNC_URL = "http://tddlab.example/api/TDDCycles/sync";
    const { app } = setup(JSON.stringify([{ token, repository, userIds: [23] }]));
    const response = await request(app).post(path).set("Cookie", session(23))
      .send({ repository }).expect(503);
    expect(response.body).not.toHaveProperty("TDD_SYNC_TOKEN");
  });
});

describe("POST /api/TDDCycles/sync", () => {
  afterEach(() => jest.restoreAllMocks());

  it("authenticates a script, saves a batch and returns a zero-change replay", async () => {
    const { app } = setup();
    const send = () =>
      request(app)
        .post("/api/TDDCycles/sync")
        .auth(token, { type: "bearer" })
        .send(mainSyncMock);
    const first = await send();
    expect(first.status).toBe(200);
    expect(first.body.summary).toMatchObject({
      repositoryCreated: true,
      commitsAdded: 1,
      executionsAdded: 1,
    });
    expect(first.body.headUpdate.status).toBe("not_applied");
    const replay = await send();
    expect(replay.status).toBe(200);
    expect(replay.body.summary).toMatchObject({
      repositoryCreated: false,
      commitsAdded: 0,
      executionsAdded: 0,
    });
  });

  it.each([
    undefined,
    "Bearer invalid",
    "Bearer " + "b".repeat(64),
    "Basic abc",
  ])("returns 401 for invalid authentication %s", async (header) => {
    const { app, save } = setup();
    const call = request(app).post("/api/TDDCycles/sync").send(mainSyncMock);
    if (header) call.set("Authorization", header);
    const response = await call;
    expect(response.status).toBe(401);
    expect(response.headers["www-authenticate"]).toBe("Bearer");
    expect(save).not.toHaveBeenCalled();
  });

  it("refuses a valid token scoped to a different repository", async () => {
    const { app, save } = setup();
    const response = await request(app)
      .post("/api/TDDCycles/sync")
      .auth(token, { type: "bearer" })
      .send({
        ...mainSyncMock,
        repository: { ...mainSyncMock.repository, name: "someone-else" },
      });
    expect(response.status).toBe(403);
    expect(save).not.toHaveBeenCalled();
  });

  it.each([
    undefined,
    "not-json",
    "[]",
    JSON.stringify([{ token: "short", repository: mainSyncMock.repository }]),
  ])(
    "returns 503 for missing or invalid server credentials %s",
    async (configuration) => {
      const { app, save } = setup(
        configuration === undefined ? "" : configuration,
      );
      const response = await request(app)
        .post("/api/TDDCycles/sync")
        .auth(token, { type: "bearer" })
        .send(mainSyncMock);
      expect(response.status).toBe(503);
      expect(response.text).not.toContain(token);
      expect(save).not.toHaveBeenCalled();
    },
  );

  it("rejects a duplicated token configuration instead of granting ambiguous access", async () => {
    const { app } = setup(
      JSON.stringify([
        { token, repository: mainSyncMock.repository },
        { token, repository: { ...mainSyncMock.repository, name: "other" } },
      ]),
    );
    const response = await request(app)
      .post("/api/TDDCycles/sync")
      .auth(token, { type: "bearer" })
      .send(mainSyncMock);
    expect(response.status).toBe(503);
  });

  it("returns 400 for invalid DTOs and 409 for event collisions without partial writes", async () => {
    const { app, repository, save } = setup();
    const send = (body: object) =>
      request(app)
        .post("/api/TDDCycles/sync")
        .auth(token, { type: "bearer" })
        .send(body);
    expect((await send({ ...mainSyncMock, schemaVersion: 9 })).status).toBe(
      400,
    );
    expect(save).not.toHaveBeenCalled();
    expect((await send(mainSyncMock)).status).toBe(200);
    const conflict = {
      ...branchASyncMock,
      executions: [
        {
          ...mainSyncMock.executions[0],
          timestamp: mainSyncMock.executions[0].timestamp + 1,
        },
      ],
    };
    expect((await send(conflict)).status).toBe(409);
    expect(await repository.listBranches(mainSyncMock.repository)).toHaveLength(
      1,
    );
    expect(
      await repository.findCommit(
        mainSyncMock.repository,
        branchASyncMock.commits[1].sha,
      ),
    ).toBeNull();
  });

  it("returns JSON for malformed JSON, a wrong content type and oversized bodies", async () => {
    const { app, save } = setup();
    const post = () =>
      request(app).post("/api/TDDCycles/sync").auth(token, { type: "bearer" });
    const malformed = await post()
      .set("Content-Type", "application/json")
      .send('{"schemaVersion":');
    expect(malformed.status).toBe(400);
    expect(malformed.body.code).toBe("INVALID_JSON");
    expect(
      (await post().set("Content-Type", "text/plain").send("hello")).status,
    ).toBe(415);
    const oversized = await post().send({
      ...mainSyncMock,
      extra: "x".repeat(2 * 1024 * 1024),
    });
    expect(oversized.status).toBe(413);
    expect(oversized.body.code).toBe("PAYLOAD_TOO_LARGE");
    expect(save).not.toHaveBeenCalled();
  });

  it("accepts a valid batch larger than the legacy default parser limit", async () => {
    const { app } = setup();
    const body = {
      ...mainSyncMock,
      commits: [{ ...mainSyncMock.commits[0], message: "m".repeat(120000) }],
    };
    expect(
      (
        await request(app)
          .post("/api/TDDCycles/sync")
          .auth(token, { type: "bearer" })
          .send(body)
      ).status,
    ).toBe(200);
  });

  it("returns 400 and leaves no repository when a relation references an absent commit", async () => {
    const { app, repository } = setup();
    const response = await request(app)
      .post("/api/TDDCycles/sync")
      .auth(token, { type: "bearer" })
      .send({ ...mainSyncMock, branchCommitShas: ["f".repeat(40)] });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_SYNC_BATCH");
    expect(await repository.findRepository(mainSyncMock.repository)).toBeNull();
  });

  it("leaves legacy routes and their parser available after the sync router", async () => {
    const { app } = setup();
    app.use(express.json());
    app.post("/api/TDDCycles/upload-log", (req, res) => {
      res.json(req.body);
    });
    const response = await request(app)
      .post("/api/TDDCycles/upload-log")
      .send({ legacy: true });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ legacy: true });
  });

  it("does not expose internal errors or tokens", async () => {
    const { app, save } = setup();
    save.mockRejectedValue(new Error("postgres://secret:password@host"));
    const response = await request(app)
      .post("/api/TDDCycles/sync")
      .auth(token, { type: "bearer" })
      .send(mainSyncMock);
    expect(response.status).toBe(500);
    expect(response.text).not.toContain("password");
    expect(response.text).not.toContain(token);
  });

  it("wires PostgreSQL lazily in production without requiring a database on import", async () => {
    const getPool = jest.spyOn(tddDb, "getTddPool").mockReturnValue({} as Pool);
    const summary = {
      repositoryCreated: true,
      branchesAdded: 1,
      commitsAdded: 1,
      commitsUpdated: 0,
      relationsAdded: 1,
      executionsAdded: 1,
      executionsUpdated: 0,
    };
    const save = jest
      .spyOn(PostgresTDDHistoryRepository.prototype, "saveBatch")
      .mockResolvedValue(summary);
    const app = express();
    app.use(
      "/api/TDDCycles",
      createTDDHistorySyncRouter({ credentials: () => credentials }),
    );
    expect(getPool).not.toHaveBeenCalled();
    expect(
      (
        await request(app)
          .post("/api/TDDCycles/sync")
          .auth(token, { type: "bearer" })
          .send(mainSyncMock)
      ).status,
    ).toBe(200);
    expect(getPool).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ branches: [{ name: "main" }] }),
    );
  });

  it("returns 503 without exposing database configuration errors", async () => {
    jest.spyOn(tddDb, "getTddPool").mockImplementation(() => {
      throw new Error("secret URL");
    });
    const app = express();
    app.use(
      "/api/TDDCycles",
      createTDDHistorySyncRouter({ credentials: () => credentials }),
    );
    const response = await request(app)
      .post("/api/TDDCycles/sync")
      .auth(token, { type: "bearer" })
      .send(mainSyncMock);
    expect(response.status).toBe(503);
    expect(response.body.code).toBe("SYNC_UNAVAILABLE");
    expect(response.text).not.toContain("secret");
  });
});
