import { createHash } from "crypto";
import { Pool, PoolClient } from "pg";
import config from "../../../config/db";

function trackingConfig() {
  const connectionString = process.env.BD_URL_NEON_TTDLAB_BD;
  if (!connectionString) {
    throw new Error("BD_URL_NEON_TTDLAB_BD must be configured for branch tracking");
  }
  return { ...config, connectionString };
}

export interface BranchTrackingIngest {
  repoOwner: string;
  repoName: string;
  branch: string;
  sha: string;
  branchOwner?: unknown;
  commitHistory: unknown[];
  tddLog: unknown[];
}

type Json = Record<string, unknown>;

function object(value: unknown): Json | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Json : null;
}

function number(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asDate(value: unknown): Date | null {
  const date = new Date(typeof value === "number" ? value : text(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function tddCycle(history: Json[], index: number): string | null {
  const current = history[index];
  const previous = index > 0 ? history[index - 1] : null;
  const declaredCycle = text(current.tdd_cycle);
  if (declaredCycle) return declaredCycle;
  const conclusion = text(current.conclusion);
  if (conclusion === "failure") return "red";
  if (conclusion === "success" && text(previous?.conclusion) === "failure") return "green";
  return null;
}

export class BranchTrackingRepository {
  constructor(private readonly pool: Pool = new Pool(trackingConfig())) {}

  async ingest(input: BranchTrackingIngest): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO tdd_branches (owner, reponame, branch, head_sha, branch_owner)
         VALUES ($1, $2, $3, $4, $5::jsonb)
         ON CONFLICT (owner, reponame, branch) DO UPDATE
         SET head_sha = EXCLUDED.head_sha,
             branch_owner = COALESCE(NULLIF(tdd_branches.branch_owner, 'null'::jsonb), EXCLUDED.branch_owner),
             updated_at = now()`,
        [input.repoOwner, input.repoName, input.branch, input.sha, JSON.stringify(input.branchOwner ?? null)]
      );
      const history = input.commitHistory.map(object).filter((entry): entry is Json => entry !== null);
      for (let index = 0; index < history.length; index += 1) {
        await this.saveCommit(client, input, history, index);
      }
      await this.saveExecutions(client, input, history);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private async saveCommit(client: PoolClient, input: BranchTrackingIngest, history: Json[], index: number): Promise<void> {
    const record = history[index];
    const sha = text(record.sha);
    const commit = object(record.commit) ?? {};
    const stats = object(record.stats) ?? {};
    const date = asDate(commit.date);
    if (!sha || !date) return;
    const testCount = number(record.test_count);
    const failed = Math.min(number(record.failed_tests), testCount);
    const passed = Math.min(Math.max(0, testCount - failed), testCount);
    const conclusion = ["success", "failure", "skipped"].includes(text(record.conclusion)) ? text(record.conclusion) : failed > 0 ? "failure" : testCount > 0 ? "success" : "skipped";
    const author = record.author ?? { name: text(record.author, "unknown") };
    await client.query(
      `INSERT INTO tdd_branch_commits
        (owner,reponame,branch,sha,html_url,url,message,commit_date,comment_count,total,additions,deletions,coverage,test_count,failed_tests,passed_tests,conclusion,tdd_cycle,author,payload)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::jsonb,$20::jsonb)
       ON CONFLICT (owner,reponame,branch,sha) DO UPDATE SET
         html_url=EXCLUDED.html_url,url=EXCLUDED.url,message=EXCLUDED.message,commit_date=EXCLUDED.commit_date,comment_count=EXCLUDED.comment_count,
         total=EXCLUDED.total,additions=EXCLUDED.additions,deletions=EXCLUDED.deletions,coverage=EXCLUDED.coverage,test_count=EXCLUDED.test_count,
         failed_tests=EXCLUDED.failed_tests,passed_tests=EXCLUDED.passed_tests,conclusion=EXCLUDED.conclusion,tdd_cycle=EXCLUDED.tdd_cycle,author=EXCLUDED.author,payload=EXCLUDED.payload`,
      [input.repoOwner,input.repoName,input.branch,sha,text(record.html_url, text(commit.url)),text(commit.url),text(commit.message),date,number(commit.comment_count),number(stats.total),number(stats.additions),number(stats.deletions),number(record.coverage),testCount,failed,passed,conclusion,tddCycle(history,index),JSON.stringify(author),JSON.stringify(record)]
    );
  }

  private async saveExecutions(client: PoolClient, input: BranchTrackingIngest, history: Json[]): Promise<void> {
    let currentSha: string | null = null;
    for (const entry of input.tddLog.map(object).filter((entry): entry is Json => entry !== null)) {
      if (typeof entry.commitId === "string") {
        currentSha = entry.commitId;
        continue;
      }
      if (currentSha) await this.saveExecution(client, input, history, currentSha, entry);
    }
  }

  private async saveExecution(client: PoolClient, input: BranchTrackingIngest, history: Json[], currentSha: string, entry: Json): Promise<void> {
    const timestamp = asDate(entry.timestamp);
    if (!timestamp) return;
    const total = number(entry.numTotalTests);
    const passed = Math.min(number(entry.numPassedTests), total);
    const reportedFailures = number(entry.failedTests, Math.max(0, total - passed));
    const failed = Math.min(reportedFailures, total - passed);
    const digest = createHash("sha256").update(`${input.repoOwner}\u0000${input.repoName}\u0000${input.branch}\u0000${currentSha}\u0000${JSON.stringify(entry)}`).digest("hex");
    const runId = `${digest.slice(0, 8)}-${digest.slice(8, 12)}-4${digest.slice(13, 16)}-8${digest.slice(17, 20)}-${digest.slice(20, 32)}`;
    const commit = history.find(item => item.sha === currentSha);
    const author = commit?.author ?? { name: "unknown" };
    await client.query(
      `INSERT INTO tdd_branch_executions (run_id,repoowner,reponame,branch,commit_sha,execution_timestamp,number_of_tests,passed_tests,failed_tests,coverage,color,author,payload)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb)
       ON CONFLICT (repoowner,reponame,branch,run_id) DO NOTHING`,
      [runId,input.repoOwner,input.repoName,input.branch,currentSha,timestamp,total,passed,failed,number(commit?.coverage),passed === total && total > 0 ? "green" : "red",JSON.stringify(author),JSON.stringify(entry)]
    );
  }

  async getBranches(owner: string, repo: string): Promise<unknown[]> {
    return (await this.pool.query(`SELECT branch AS name, head_sha AS "headSha", branch_owner AS owner, updated_at AS "updatedAt" FROM tdd_branches WHERE owner=$1 AND reponame=$2 ORDER BY branch`, [owner, repo])).rows;
  }

  async getCommitHistory(owner: string, repo: string, branch: string): Promise<unknown[]> {
    return (await this.pool.query(`SELECT sha, html_url, total, additions, deletions, commit_date, message, url, comment_count, coverage, test_count, failed_tests, conclusion, tdd_cycle, author FROM tdd_branch_commits WHERE owner=$1 AND reponame=$2 AND branch=$3 ORDER BY commit_date DESC`, [owner,repo,branch])).rows.map(row => ({
      html_url: row.html_url, sha: row.sha, stats: { total: row.total, additions: row.additions, deletions: row.deletions, date: row.commit_date }, commit: { date: row.commit_date, message: row.message, url: row.url, comment_count: row.comment_count }, coverage: Number(row.coverage), test_count: row.test_count, failed_tests: row.failed_tests, conclusion: row.conclusion, tdd_cycle: row.tdd_cycle, author: row.author
    }));
  }

  async getCommitCycles(owner: string, repo: string, branch: string): Promise<unknown[]> {
    return (await this.pool.query(`SELECT sha,url,tdd_cycle,coverage,author FROM tdd_branch_commits WHERE owner=$1 AND reponame=$2 AND branch=$3 ORDER BY commit_date DESC`, [owner,repo,branch])).rows.map(row => ({ url: row.url, sha: row.sha, tddCycle: row.tdd_cycle ?? "null", coverage: Number(row.coverage), author: row.author }));
  }

  async getTestLog(owner: string, repo: string, branch: string): Promise<unknown[]> {
    const rows = (await this.pool.query(
      `SELECT timeline.commit_sha, timeline.execution_timestamp, timeline.number_of_tests, timeline.passed_tests,
              timeline.failed_tests, timeline.payload, commits.message, commits.commit_date
       FROM tdd_branch_executions timeline
       LEFT JOIN tdd_branch_commits commits ON commits.owner=timeline.repoowner AND commits.reponame=timeline.reponame
         AND commits.branch=timeline.branch AND commits.sha=timeline.commit_sha
       WHERE timeline.repoowner=$1 AND timeline.reponame=$2 AND timeline.branch=$3
       ORDER BY timeline.execution_timestamp`, [owner, repo, branch]
    )).rows;
    const seenCommits = new Set<string>();
    const log: unknown[] = [];
    for (const row of rows) {
      if (row.commit_sha && !seenCommits.has(row.commit_sha)) {
        seenCommits.add(row.commit_sha);
        log.push({ commitId: row.commit_sha, commitName: row.message ?? "", commitTimestamp: new Date(row.commit_date ?? row.execution_timestamp).getTime(), testId: log.length });
      }
      log.push({ ...(row.payload as Json), numPassedTests: row.passed_tests, failedTests: row.failed_tests, numTotalTests: row.number_of_tests, timestamp: new Date(row.execution_timestamp).getTime(), testId: log.length });
    }
    return log;
  }
}
