import { Pool } from "pg";
import config from "../../../config/db";
import { ITDDVisualizationRepository } from "../Domain/ITDDVisualizationRepository";
import { CommitHistoryData } from "../Domain/ICommitHistoryData";
import { CommitCycleData } from "../Domain/ICommitCycleData";
import { TDDDatabasePool } from "./TDDDatabase";
import { serializeTDDLogs, StoredTDDLog } from "./serializeTDDLogs";

interface CommitMetricsRow {
  html_url: string | null;
  sha: string;
  total: number | null;
  additions: number | null;
  deletions: number | null;
  message: string | null;
  url: string | null;
  comment_count: number | null;
  commit_date: Date | null;
  coverage: string | null;
  test_count: number;
  conclusion: string | null;
  tdd_cycle: string | null;
}

function coverage(value: string | null): number | null {
  return value === null || value === "" ? null : Number(value);
}

export class VisualizeTDDRepository implements ITDDVisualizationRepository {
  private readonly pool: TDDDatabasePool;

  constructor(pool?: TDDDatabasePool) {
    this.pool = pool ?? new Pool(config);
  }

  async getCommitHistoryData(owner: string, repoName: string): Promise<CommitHistoryData[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<CommitMetricsRow>(`
        SELECT html_url, sha, total, additions, deletions, message, url,
               comment_count, commit_date, coverage, test_count, conclusion
        FROM tdd_commit_metrics
        WHERE lower(owner) = lower($1) AND lower(reponame) = lower($2)
        ORDER BY commit_date DESC, sha
      `, [owner, repoName]);
      return result.rows.map((row) => {
        if (!row.commit_date) throw new Error("A recorded commit is missing its date");
        const date = new Date(row.commit_date);
        return {
          html_url: row.html_url ?? "",
          sha: row.sha,
          stats: {
            total: row.total ?? 0,
            additions: row.additions ?? 0,
            deletions: row.deletions ?? 0,
            date: date.toISOString(),
          },
          commit: { date, message: row.message ?? "", url: row.url ?? "", comment_count: row.comment_count ?? 0 },
          coverage: coverage(row.coverage),
          test_count: row.test_count,
          conclusion: row.conclusion ?? "unknown",
        };
      });
    } finally {
      client.release();
    }
  }

  async getCommitCyclesData(owner: string, repoName: string): Promise<CommitCycleData[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<CommitMetricsRow>(`
        SELECT url, sha, tdd_cycle, coverage FROM tdd_commit_metrics
        WHERE lower(owner) = lower($1) AND lower(reponame) = lower($2)
        ORDER BY commit_date, sha
      `, [owner, repoName]);
      return result.rows.map((row) => ({
        url: row.url ?? "",
        sha: row.sha,
        tddCycle: row.tdd_cycle ?? "null",
        coverage: coverage(row.coverage),
      }));
    } finally {
      client.release();
    }
  }

  async getTDDLogs(owner: string, repoName: string) {
    const client = await this.pool.connect();
    try {
      const result = await client.query<StoredTDDLog>(`
        WITH RECURSIVE graph AS (
          SELECT sha, parents FROM tdd_current_commits
          WHERE lower(owner) = lower($1) AND lower(reponame) = lower($2)
          UNION
          SELECT parent.sha, parent.parents FROM commitstable parent
          JOIN graph child ON child.parents ? parent.sha
          WHERE lower(parent.owner) = lower($1) AND lower(parent.reponame) = lower($2)
        )
        SELECT * FROM tdd_logs WHERE id IN (
          SELECT id FROM tdd_current_logs
          WHERE lower(owner) = lower($1) AND lower(reponame) = lower($2)
          UNION
          SELECT log.id FROM tdd_logs log JOIN graph ON graph.sha = log.commit_sha
          WHERE lower(log.owner) = lower($1) AND lower(log.reponame) = lower($2)
            AND log.type = 'commit_event'
        ) ORDER BY timestamp, id
      `, [owner, repoName]);
      return serializeTDDLogs(result.rows);
    } finally {
      client.release();
    }
  }
}
