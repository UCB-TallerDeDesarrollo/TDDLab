import { Pool } from "pg";
import config from "../../../../src/config/db";

const databaseTests = process.env.TDD_TEST_DATABASE === "true" ? describe : describe.skip;

databaseTests("TDD ingestion projections on a development database", () => {
  let pool: Pool;
  const [owner, repoName] = (process.env.TDD_TEST_REPOSITORY ?? "").toLowerCase().split("/");
  beforeAll(() => {
    if (!owner || !repoName) throw new Error("Set TDD_TEST_REPOSITORY to the test owner/repository");
    pool = new Pool(config);
  });
  afterAll(async () => { if (pool) await pool.end(); });

  it("exposes each recorded execution at most once", async () => {
    const { rows } = await pool.query(`
      SELECT count(*)::int AS total, count(DISTINCT event_id)::int AS unique_total
      FROM tdd_current_logs WHERE lower(owner) = $1 AND lower(reponame) = $2
        AND event_id IS NOT NULL AND type = 'test_execution'
    `, [owner, repoName]);
    expect(rows[0].total).toBeGreaterThan(0);
    expect(rows[0].total).toBe(rows[0].unique_total);
  });

  it("retains an audit association for every current execution", async () => {
    const { rows } = await pool.query(`
      SELECT count(*)::int AS missing FROM tdd_logs l
      WHERE lower(l.owner) = $1 AND lower(l.reponame) = $2 AND l.event_id IS NOT NULL
        AND l.type = 'test_execution' AND l.commit_sha IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM tdd_execution_commits h WHERE h.owner = $1 AND h.reponame = $2
          AND h.event_id = l.event_id AND h.commit_sha = l.commit_sha)
    `, [owner, repoName]);
    expect(rows[0].missing).toBe(0);
  });

  it("preserves legacy logs in the current projection", async () => {
    const { rows } = await pool.query(`
      SELECT count(*)::int AS missing FROM tdd_logs l
      WHERE lower(l.owner) = $1 AND lower(l.reponame) = $2 AND l.event_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM tdd_current_logs current WHERE current.id = l.id)
    `, [owner, repoName]);
    expect(rows[0].missing).toBe(0);
  });
});
