import express from "express";
import request from "supertest";
import { FakeDBJobsRepository } from "../../src/modules/TDDCycles/Repositories/FakeDBJobsRepository";
import { FakeGithubRepository } from "../../src/modules/TDDCycles/Repositories/FakeGithubRepository";
import { ITestResultRegistrationRepository } from "../../src/modules/TDDCycles/Domain/ITestResultRegistrationRepository";
import { tddCyclesJsonErrorHandler } from "../../src/middleware/tddCyclesJsonErrorHandler";

const path = "/api/TDDCycles/jobs";
const valid = { sha: "abc123", owner: "demo", reponame: "tests", conclusion: "success" };

function createTestApp(jobs: FakeDBJobsRepository, registrationRepository: ITestResultRegistrationRepository | null = jobs) {
  jest.resetModules();
  jest.doMock("../../src/modules/TDDCycles/Repositories/createTDDCyclesDependencies", () => ({
    createTDDCyclesDependencies: () => ({
      dbJobsRepository: jobs,
      githubRepository: new FakeGithubRepository(),
      registrationRepository,
    }),
  }));
  const router = (require("../../src/routes/TDDCyclesRoutes") as typeof import("../../src/routes/TDDCyclesRoutes")).default;
  const app = express();
  app.use(express.json());
  app.use("/api/TDDCycles", router);
  app.use(tddCyclesJsonErrorHandler);
  return app;
}

describe("POST /api/TDDCycles/jobs", () => {
  let jobs: FakeDBJobsRepository;
  let app: express.Express;

  beforeEach(() => {
    jobs = new FakeDBJobsRepository();
    app = createTestApp(jobs);
  });

  afterEach(() => { jest.dontMock("../../src/modules/TDDCycles/Repositories/createTDDCyclesDependencies"); });

  it("responde 201 y created para un registro nuevo", async () => {
    const response = await request(app).post(path).send(valid);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ status: "created" });
  });

  it.each(["success", "failure", "skipped"])("acepta la conclusión %s", async (conclusion) => {
    const response = await request(app).post(path).send({ ...valid, conclusion });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ status: "created" });
    await expect(jobs.findJobByCommit(valid.sha, valid.owner, valid.reponame)).resolves.toEqual(expect.objectContaining({ ...valid, conclusion }));
  });

  it.each(["sha", "owner", "reponame", "conclusion"])("identifica el campo ausente %s", async (field) => {
    const body: Record<string, unknown> = { ...valid };
    delete body[field];
    const response = await request(app).post(path).send(body);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: `Invalid field: ${field}`, field });
  });

  it("rechaza un campo vacío", async () => {
    const response = await request(app).post(path).send({ ...valid, sha: "  " });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid field: sha", field: "sha" });
  });

  it("rechaza un tipo de campo incorrecto", async () => {
    const response = await request(app).post(path).send({ ...valid, owner: 123 });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid field: owner", field: "owner" });
  });

  it("rechaza una conclusión inválida", async () => {
    const response = await request(app).post(path).send({ ...valid, conclusion: "pending" });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid field: conclusion", field: "conclusion" });
  });

  it("rechaza un cuerpo JSON de tipo array", async () => {
    const response = await request(app).post(path).send([]);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid request body", field: "body" });
  });

  it("responde JSON controlado para sintaxis JSON incorrecta", async () => {
    const response = await request(app).post(path).set("Content-Type", "application/json").send('{"sha":');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid JSON", field: "body" });
  });

  it("responde duplicate sin guardar otro registro", async () => {
    expect((await request(app).post(path).send(valid)).status).toBe(201);
    const response = await request(app).post(path).send(valid);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "duplicate" });
    expect((await jobs.getJobs(valid.owner, valid.reponame)).filter((job) => job.sha === valid.sha)).toHaveLength(1);
  });

  it("responde conflict ante una conclusión diferente", async () => {
    expect((await request(app).post(path).send(valid)).status).toBe(201);
    const response = await request(app).post(path).send({ ...valid, conclusion: "failure" });
    expect(response.status).toBe(409);
    expect(response.body).toEqual({ status: "conflict" });
  });

  it("conserva el resultado original ante un conflicto", async () => {
    expect((await request(app).post(path).send(valid)).status).toBe(201);
    expect((await request(app).post(path).send({ ...valid, conclusion: "failure" })).status).toBe(409);
    await expect(jobs.findJobByCommit(valid.sha, valid.owner, valid.reponame)).resolves.toEqual(expect.objectContaining(valid));
    expect((await jobs.getJobs(valid.owner, valid.reponame)).filter((job) => job.sha === valid.sha)).toHaveLength(1);
  });

  it.each(["reponame", "owner"])("permite el mismo SHA con diferente %s", async (field) => {
    const other = { ...valid, [field]: "other" };
    expect((await request(app).post(path).send(valid)).status).toBe(201);
    expect((await request(app).post(path).send(other)).status).toBe(201);
    const records = (await jobs.getJobs(valid.owner, valid.reponame)).filter((job) => job.sha === valid.sha);
    expect(records).toHaveLength(2);
    expect(records).toEqual(expect.arrayContaining([expect.objectContaining(valid), expect.objectContaining(other)]));
  });

  it("permite consultar mediante GET el registro creado con la misma instancia", async () => {
    expect((await request(app).post(path).send(valid)).status).toBe(201);
    const response = await request(app).get(path).query({ owner: valid.owner, repoName: valid.reponame });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining(valid)]));
  });

  it("resuelve POST idénticos concurrentes sin duplicar", async () => {
    const responses = await Promise.all([request(app).post(path).send(valid), request(app).post(path).send(valid)]);
    expect(responses.map((response) => response.status).sort()).toEqual([200, 201]);
    expect(responses.map((response) => response.body.status).sort()).toEqual(["created", "duplicate"]);
    expect((await jobs.getJobs(valid.owner, valid.reponame)).filter((job) => job.sha === valid.sha)).toHaveLength(1);
  });

  it("oculta los detalles de errores inesperados", async () => {
    const failing: ITestResultRegistrationRepository = { register: async () => { throw new Error("sensitive internal detail"); } };
    const response = await request(createTestApp(jobs, failing)).post(path).send(valid);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal server error" });
    expect(response.text).not.toContain("sensitive internal detail");
  });

  it("responde 503 si no hay adaptador de registro", async () => {
    const response = await request(createTestApp(jobs, null)).post(path).send(valid);
    expect(response.status).toBe(503);
    expect(response.body).toEqual({ error: "Registration repository unavailable" });
  });

  it("mantiene GET de HU-02 con los tres resultados de demostración", async () => {
    const response = await request(app).get(path).query({ owner: "any-owner", repoName: "any-repository" });
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      expect.objectContaining({ sha: "commit-all-tests-passed", conclusion: "success" }),
      expect.objectContaining({ sha: "commit-tests-failed", conclusion: "failure" }),
      expect.objectContaining({ sha: "commit-without-tests", conclusion: "skipped" }),
    ]);
  });
});
