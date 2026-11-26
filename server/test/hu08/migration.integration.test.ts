import express from "express";
import request from "supertest";
import { Pool } from "pg";
import { readFileSync, promises as fs } from "fs";
import os from "os";
import path from "path";
import { DatabaseTDDResultsRepository, FakeTDDResultsRepository, FileTDDResultsRepository, mapCommitHistory } from "../../src/modules/TDDCycles/Repositories/TDDResultsRepository";
import { ITDDResultsRepository, TDDResultsSnapshot } from "../../src/modules/TDDCycles/Domain/ITDDResultsRepository";
import { DBJobsRepository } from "../../src/modules/TDDCycles/Repositories/DBJobsRepository";
import { FakeGithubRepository } from "../../src/modules/TDDCycles/Repositories/FakeGithubRepository";
import { FakeDBJobsRepository } from "../../src/modules/TDDCycles/Repositories/FakeDBJobsRepository";
import { tddCyclesJsonErrorHandler } from "../../src/middleware/tddCyclesJsonErrorHandler";
import { IngestTDDResultsUseCase } from "../../src/modules/TDDCycles/Application/ingestTDDResultsUseCase";

const fixture = { ...JSON.parse(readFileSync(path.join(__dirname, "../../../docs/hu08/fixtures/ingest-payload.json"), "utf8")), repoOwner: "hu08-integration" };
const snapshot: TDDResultsSnapshot = { commitHistory: fixture.commitHistory, tddLog: fixture.tddLog };
const integration = process.env.TDDLAB_TEST_DATABASE_URL ? describe : describe.skip;
const wire = (value: unknown) => JSON.parse(JSON.stringify(value));

integration("HU08 PostgreSQL real y contrato archivo falso base de datos", () => {
  const pool = new Pool({ connectionString: process.env.TDDLAB_TEST_DATABASE_URL, ssl: false, connectionTimeoutMillis: 5000 });
  const database = new DatabaseTDDResultsRepository(pool);
  const jobs = new DBJobsRepository(pool);
  let directory: string;
  let adapters: ITDDResultsRepository[];
  let app: express.Express;

  beforeAll(async () => {
    await pool.query(readFileSync(path.join(__dirname, "../../migrations/008_tdd_migration_validation.sql"), "utf8"));
    directory = await fs.mkdtemp(path.join(os.tmpdir(), "tddlab-hu08-"));
    adapters = [new FileTDDResultsRepository(directory), new FakeTDDResultsRepository(), database];
    jest.doMock("../../src/modules/TDDCycles/Repositories/createTDDCyclesDependencies", () => ({
      createTDDCyclesDependencies: () => ({ dbJobsRepository: jobs, githubRepository: new FakeGithubRepository(), registrationRepository: jobs, resultsRepository: database }),
    }));
    const router = require("../../src/routes/TDDCyclesRoutes").default;
    app = express();
    app.use(express.json());
    app.use("/api/TDDCycles", router);
    app.use(tddCyclesJsonErrorHandler);
  }, 30000);
  beforeEach(async () => {
    await pool.query("DELETE FROM tdd_result_snapshots WHERE owner = $1", [fixture.repoOwner]);
    await pool.query("DELETE FROM jobstable WHERE owner = $1", [fixture.repoOwner]);
  });
  afterAll(async () => {
    jest.dontMock("../../src/modules/TDDCycles/Repositories/createTDDCyclesDependencies");
    await pool.query("DELETE FROM tdd_result_snapshots WHERE owner = $1", [fixture.repoOwner]);
    await pool.query("DELETE FROM jobstable WHERE owner = $1", [fixture.repoOwner]);
    await pool.end();
    // Remove only the unique temporary directory created by this suite.
    if (directory && path.dirname(directory) === os.tmpdir() && path.basename(directory).startsWith("tddlab-hu08-")) await fs.rm(directory, { recursive: true });
  });

  it("aplica la migración dos veces sin borrar datos", async () => {
    await database.saveSnapshot(fixture.repoOwner, fixture.repoName, "main", snapshot);
    await pool.query(readFileSync(path.join(__dirname, "../../migrations/008_tdd_migration_validation.sql"), "utf8"));
    expect(await database.getSnapshot(fixture.repoOwner, fixture.repoName, "main")).toEqual(snapshot);
  });

  it.each([0, 1, 2])("caso %i conserva todos los campos entre JSON SELECT y HTTP", async index => {
    expect((await request(app).post("/api/TDDCycles/ingest-logs").send(fixture)).status).toBe(200);
    const stored = await pool.query("SELECT commit_history, tdd_log FROM tdd_result_snapshots WHERE owner=$1 AND reponame=$2 AND branch='main'", [fixture.repoOwner, fixture.repoName]);
    expect(stored.rows[0].commit_history[index]).toEqual(fixture.commitHistory[index]);
    expect(stored.rows[0].tdd_log).toEqual(fixture.tddLog);
    const response = await request(app).get("/api/TDDCycles/commits-history").query({ owner: fixture.repoOwner, repoName: fixture.repoName, branch: "main" });
    expect(response.status).toBe(200);
    expect(response.body.find((entry: any) => entry.sha === fixture.commitHistory[index].sha)).toEqual(wire(mapCommitHistory([fixture.commitHistory[index]])[0]));
    const log = await request(app).get("/api/TDDCycles/test-log").query({ owner: fixture.repoOwner, repoName: fixture.repoName });
    expect(log.body).toEqual(fixture.tddLog);
  });

  it("los tres adaptadores devuelven valores y tipos idénticos para los tres casos", async () => {
    for (const adapter of adapters) await adapter.saveSnapshot(fixture.repoOwner, fixture.repoName, fixture.branch, snapshot);
    const expected = wire(mapCommitHistory(snapshot.commitHistory));
    for (const adapter of adapters) {
      expect(await adapter.getSnapshot(fixture.repoOwner, fixture.repoName, "main")).toEqual(snapshot);
      const commits = await adapter.getCommitHistoryData(fixture.repoOwner, fixture.repoName);
      expect(commits.every(commit => commit.commit.date instanceof Date)).toBe(true);
      expect(wire(commits)).toEqual(expected);
      expect(await adapter.getTestLog(fixture.repoOwner, fixture.repoName)).toEqual(snapshot.tddLog);
      expect(await adapter.getCommitCyclesData(fixture.repoOwner, fixture.repoName)).toEqual(await database.getCommitCyclesData(fixture.repoOwner, fixture.repoName));
    }
  });

  it("registra 201 consulta idéntico y reenvía sin duplicar con PostgreSQL real", async () => {
    const fakeJobs = new FakeDBJobsRepository();
    for (const entry of snapshot.commitHistory) {
      const payload = { sha: entry.sha, owner: fixture.repoOwner, reponame: fixture.repoName, conclusion: entry.conclusion, branch: "feature/hu08" };
      expect((await request(app).post("/api/TDDCycles/jobs").send(payload)).status).toBe(201);
      expect((await request(app).post("/api/TDDCycles/jobs").send(payload)).body).toEqual({ status: "duplicate" });
      const get = await request(app).get("/api/TDDCycles/jobs").query({ owner: fixture.repoOwner, repoName: fixture.repoName });
      expect(get.status).toBe(200);
      expect(get.body).toContainEqual(expect.objectContaining(payload));
      await fakeJobs.register(payload);
      const persisted = get.body.find((job: any) => job.sha === payload.sha);
      const fake = await fakeJobs.findJobByCommit(payload.sha, payload.owner, payload.reponame);
      expect(typeof persisted.id).toBe("number");
      expect(Object.keys(persisted).sort()).toEqual(Object.keys(fake!).sort());
      const { id: _databaseId, ...databaseFields } = persisted;
      const { id: _fakeId, ...fakeFields } = fake!;
      expect(databaseFields).toEqual(fakeFields);
    }
    expect((await pool.query("SELECT count(*)::int AS count FROM jobstable WHERE owner=$1", [fixture.repoOwner])).rows[0].count).toBe(3);
  });

  it("reenvía el par de JSON de forma concurrente y mantiene una sola copia", async () => {
    const responses = await Promise.all(Array.from({ length: 4 }, () => request(app).post("/api/TDDCycles/ingest-logs").send(fixture)));
    expect(responses.map(response => response.status)).toEqual([200, 200, 200, 200]);
    expect((await pool.query("SELECT count(*)::int AS count FROM tdd_result_snapshots WHERE owner=$1", [fixture.repoOwner])).rows[0].count).toBe(1);
    expect(await database.getSnapshot(fixture.repoOwner, fixture.repoName, "main")).toEqual(snapshot);
  });

  it("dos registros concurrentes idénticos crean una sola fila", async () => {
    const payload = { sha: "concurrent", owner: fixture.repoOwner, reponame: fixture.repoName, conclusion: "success" };
    const responses = await Promise.all(Array.from({ length: 5 }, () => request(app).post("/api/TDDCycles/jobs").send(payload)));
    expect(responses.filter(response => response.status === 201)).toHaveLength(1);
    expect(responses.filter(response => response.status === 200)).toHaveLength(4);
  });

  it("rechaza conflicto sin alterar el dato original", async () => {
    const payload = { sha: "conflict", owner: fixture.repoOwner, reponame: fixture.repoName, conclusion: "success" };
    await request(app).post("/api/TDDCycles/jobs").send(payload);
    expect((await request(app).post("/api/TDDCycles/jobs").send({ ...payload, conclusion: "failure" })).status).toBe(409);
    expect((await jobs.findJobByCommit(payload.sha, payload.owner, payload.reponame)).conclusion).toBe("success");
  });

  it("aísla repositorio propietario y ramas con barras en los tres adaptadores", async () => {
    for (const adapter of adapters) {
      await adapter.saveSnapshot(fixture.repoOwner, fixture.repoName, "feature/hu08", snapshot);
      for (const [owner, repo, branch] of [["different-owner", fixture.repoName, "feature/hu08"], [fixture.repoOwner, "different-repo", "feature/hu08"], [fixture.repoOwner, fixture.repoName, "other/branch"]]) {
        expect(await adapter.getCommitHistoryData(owner, repo, branch)).toEqual([]);
      }
      expect(await adapter.getSnapshot(fixture.repoOwner, fixture.repoName, "feature/hu08")).toEqual(snapshot);
    }
  });

  it("rechaza JSON inválido y conserva el par previo completo", async () => {
    await database.saveSnapshot(fixture.repoOwner, fixture.repoName, "main", snapshot);
    const bad = wire(fixture);
    bad.commitHistory[0].test_count = -1;
    const response = await request(app).post("/api/TDDCycles/ingest-logs").send(bad);
    expect(response.status).toBe(400);
    expect(response.body.field).toBe("commitHistory[0].test_count");
    expect(await database.getSnapshot(fixture.repoOwner, fixture.repoName, "main")).toEqual(snapshot);
  });

  it.each([
    ["Luiscuac-TotalizadorVentasIngSoftware", "Luiscuac", "TotalizadorVentasIngSoftware", 13],
    ["HenryRiveraM-fizzbuzz", "HenryRiveraM", "fizzbuzz", 5],
    ["RashLop-TennisPlay", "RashLop", "TennisPlay", 9],
  ])("migra y compara la muestra real %s sin perder campos", async (file, owner, repo, count) => {
    const folder = path.join(__dirname, "../../../docs/hu08/evidence/references");
    const manifest = JSON.parse(readFileSync(path.join(folder, "reference-check.json"), "utf8"));
    const source = manifest.results.find((entry: any) => entry.repository === `https://github.com/${owner}/${repo}`);
    const history = JSON.parse(readFileSync(path.join(folder, `${file}-commit-history.json`), "utf8"));
    const logInfo = source.files.find((entry: any) => entry.localFile === `${file}-tdd_log.json`);
    const log = logInfo ? JSON.parse(readFileSync(path.join(folder, logInfo.localFile), "utf8")) : [];
    const expected: TDDResultsSnapshot = JSON.parse(JSON.stringify({ commitHistory: history, tddLog: log }));
    expected.commitHistory.forEach(entry => { if (entry.sha === "HEAD") entry.sha = source.ref; });
    expected.tddLog.forEach(entry => { if (entry.commitId === "HEAD") entry.commitId = source.ref; });
    for (const adapter of adapters) {
      await new IngestTDDResultsUseCase(adapter).execute({ repoOwner: fixture.repoOwner, repoName: repo, branch: "main", sha: source.ref, commitHistory: history, tddLog: log });
      expect(await adapter.getSnapshot(fixture.repoOwner, repo as string, "main")).toEqual(expected);
      const commits = await adapter.getCommitHistoryData(fixture.repoOwner, repo as string);
      expect(commits).toHaveLength(count as number);
      expect(wire(commits)).toEqual(wire(mapCommitHistory(expected.commitHistory)));
      // Historical JSON objects must remain untouched by normalization and storage.
      expect(history[history.length - 1].sha).toBe("HEAD");
    }
  });
});
