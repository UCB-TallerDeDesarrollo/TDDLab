import { Pool } from "pg";
import config from "../../../config/db";
import { IVisualizeTDDRepository } from "../Domain/IVisualizeTDDRepository";
import { CommitHistoryData } from "../Domain/ICommitHistoryData";
import { CommitCycleData } from "../Domain/ICommitCycleData";
import { TDDLogEntry, TestExecutionLog, CommitLog } from "../Domain/TDDLogEntry";

export class VisualizeTDDRepository implements IVisualizeTDDRepository {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool = pool || new Pool(config);
  }

  async getCommitHistoryData(owner: string, repoName: string): Promise<CommitHistoryData[]> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT owner, reponame, html_url, sha, total, additions, deletions,
               message, url, comment_count, commit_date, coverage, test_count,
               conclusion, parents, tdd_cycle
        FROM commitstable
        WHERE LOWER(owner) = LOWER($1) AND LOWER(reponame) = LOWER($2)
        ORDER BY commit_date DESC
      `;
      const result = await client.query(query, [owner, repoName]);

      const commits: CommitHistoryData[] = result.rows.map((row) => ({
        html_url: row.html_url || "",
        sha: row.sha,
        stats: {
          total: Number(row.total) || 0,
          additions: Number(row.additions) || 0,
          deletions: Number(row.deletions) || 0,
          date: row.commit_date ? new Date(row.commit_date).toISOString() : new Date().toISOString(),
        },
        commit: {
          date: row.commit_date ? new Date(row.commit_date) : new Date(),
          message: row.message || "",
          url: row.url || "",
          comment_count: Number(row.comment_count) || 0,
        },
        coverage: Number(row.coverage) || 0,
        test_count: Number(row.test_count) || 0,
        conclusion: row.conclusion || "unknown",
      }));

      return commits;
    } catch (error) {
      console.error(`Error retrieving commit history from DB for ${owner}/${repoName}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getCommitCyclesData(owner: string, repoName: string): Promise<CommitCycleData[]> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT url, sha, tdd_cycle, coverage
        FROM commitstable
        WHERE LOWER(owner) = LOWER($1) AND LOWER(reponame) = LOWER($2)
        ORDER BY commit_date ASC
      `;
      const result = await client.query(query, [owner, repoName]);

      return result.rows.map((row) => ({
        url: row.url || "",
        sha: row.sha,
        tddCycle: row.tdd_cycle ?? "null",
        coverage: Number(row.coverage) || 0,
      }));
    } catch (error) {
      console.error(`Error retrieving commit cycles from DB for ${owner}/${repoName}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getTDDLogs(owner: string, repoName: string): Promise<TDDLogEntry[]> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT id, owner, reponame, type, test_id, commit_sha, commit_name,
               num_passed_tests, failed_tests, num_total_tests, timestamp, success, git_graph
        FROM tdd_logs
        WHERE LOWER(owner) = LOWER($1) AND LOWER(reponame) = LOWER($2)
        ORDER BY timestamp ASC, id ASC
      `;
      const result = await client.query(query, [owner, repoName]);

      const logs: TDDLogEntry[] = result.rows.map((row) => {
        if (row.type === "commit_event" || row.commit_sha) {
          const commitLog: CommitLog = {
            commitId: row.commit_sha,
            commitName: row.commit_name || "",
            commitTimestamp: Number(row.timestamp),
            testId: Number(row.test_id),
            gitGraph: row.git_graph
              ? typeof row.git_graph === "string"
                ? JSON.parse(row.git_graph)
                : row.git_graph
              : undefined,
          };
          return commitLog;
        } else {
          const testLog: TestExecutionLog = {
            numPassedTests: Number(row.num_passed_tests) || 0,
            failedTests: Number(row.failed_tests) || 0,
            numTotalTests: Number(row.num_total_tests) || 0,
            timestamp: Number(row.timestamp) || 0,
            success: Boolean(row.success),
            testId: Number(row.test_id) || 0,
          };
          return testLog;
        }
      });

      return logs;
    } catch (error) {
      console.error(`Error retrieving TDD logs from DB for ${owner}/${repoName}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async saveTDDLogs(owner: string, repoName: string, logs: TDDLogEntry[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      for (const log of logs) {
        if ("commitId" in log) {
          const query = `
            INSERT INTO tdd_logs (owner, reponame, type, test_id, commit_sha, commit_name, timestamp, git_graph)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `;
          const values = [
            owner,
            repoName,
            "commit_event",
            log.testId,
            log.commitId,
            log.commitName,
            log.commitTimestamp,
            log.gitGraph ? JSON.stringify(log.gitGraph) : null,
          ];
          await client.query(query, values);
        } else {
          const query = `
            INSERT INTO tdd_logs (owner, reponame, type, test_id, num_passed_tests, failed_tests, num_total_tests, timestamp, success)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `;
          const values = [
            owner,
            repoName,
            "test_execution",
            log.testId,
            log.numPassedTests,
            log.failedTests,
            log.numTotalTests,
            log.timestamp,
            log.success,
          ];
          await client.query(query, values);
        }
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`Error saving TDD logs to DB for ${owner}/${repoName}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
}
