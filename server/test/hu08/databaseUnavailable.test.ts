import express from "express";
import request from "supertest";
import { Pool } from "pg";
import TDDCyclesController from "../../src/controllers/TDDCycles/TDDCyclesController";
import { DBJobsRepository } from "../../src/modules/TDDCycles/Repositories/DBJobsRepository";
import { DBCommitsRepository } from "../../src/modules/TDDCycles/Repositories/DBCommitsRepository";
import { FakeGithubRepository } from "../../src/modules/TDDCycles/Repositories/FakeGithubRepository";
import { DatabaseTDDResultsRepository } from "../../src/modules/TDDCycles/Repositories/TDDResultsRepository";

describe("HU08 base de datos no disponible", () => {
  it("responde 500 controlado en lectura y escritura y el servidor sigue vivo", async () => {
    const pool = new Pool({ host: "127.0.0.1", port: 1, database: "unavailable_hu08", user: "hu08", ssl: false, connectionTimeoutMillis: 300 });
    const jobs = new DBJobsRepository(pool);
    const commits = new DBCommitsRepository();
    const controller = new TDDCyclesController(commits, jobs, new FakeGithubRepository(), jobs, new DatabaseTDDResultsRepository(pool));
    const app = express();app.use(express.json());
    app.get("/history", (req, res) => controller.getCommitHistory(req, res));
    app.post("/jobs", (req, res) => controller.registerTestResult(req, res));
    app.get("/health", (_req, res) => res.json({ ok: true }));
    try {
      const read = await request(app).get("/history").query({ owner: "hu08", repoName: "tests" });
      expect(read.status).toBe(500);
      expect(read.body).toEqual({ error: "Server error" });
      const write = await request(app).post("/jobs").send({ sha: "abc", owner: "hu08", reponame: "tests", conclusion: "success" });
      expect(write.status).toBe(500);
      expect(write.body).toEqual({ error: "Internal server error" });
      expect((await request(app).get("/health")).body).toEqual({ ok: true });
    } finally { await pool.end();await commits.pool.end(); }
  });
});
