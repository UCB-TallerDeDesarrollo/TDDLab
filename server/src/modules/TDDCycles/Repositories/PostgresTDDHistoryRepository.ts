import { isDeepStrictEqual } from "node:util";
import type { Pool, PoolClient } from "pg";
import type { ITDDHistoryRepository } from "../Domain/ITDDHistoryRepository";
import { InvalidTDDHistoryBatchError } from "../Domain/TDDHistory";
import type {
  BranchRecord,
  CommitRecord,
  ExecutionFilter,
  RepositoryKey,
  SaveSummary,
  TDDHistoryBatch,
  TestExecutionRecord,
} from "../Domain/TDDHistory";
import { mergeCommit, mergeExecution, validateBatch } from "../Domain/TDDHistoryWriteRules";

interface CommitRow {
  sha: string;
  parent_shas: string[] | null;
  message: string;
  committed_at: Date | null;
  additions: string | null;
  deletions: string | null;
  total_changes: string | null;
  metrics: CommitRecord["metrics"];
}

interface ExecutionRow {
  event_id: string;
  branch_at_capture: string | null;
  head_sha_at_execution: string | null;
  associated_commit_sha: string | null;
  timestamp_ms: string;
  num_passed_tests: string;
  failed_tests: string;
  num_total_tests: string;
  coverage_percentage: number | null;
  success: boolean;
  test_id: string | null;
}

const repositoryId = `
  SELECT id FROM tdd_history.repositories
  WHERE provider = $1 AND owner = $2 AND name = $3
`;

function repositoryValues({ provider, owner, name }: RepositoryKey): string[] {
  return [provider, owner, name];
}

function safeInteger(value: string): number {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new RangeError("TDD history contains an out-of-range integer");
  }
  return number;
}

function commitRecord(row: CommitRow): CommitRecord {
  const { additions, deletions, total_changes } = row;
  return {
    sha: row.sha,
    parentShas: row.parent_shas,
    message: row.message,
    committedAt: row.committed_at?.toISOString() ?? null,
    stats: additions === null || deletions === null || total_changes === null
      ? null
      : { additions: safeInteger(additions), deletions: safeInteger(deletions), total: safeInteger(total_changes) },
    metrics: row.metrics,
  };
}

function executionRecord(row: ExecutionRow): TestExecutionRecord {
  return {
    eventId: row.event_id,
    branchAtCapture: row.branch_at_capture,
    headShaAtExecution: row.head_sha_at_execution,
    associatedCommitSha: row.associated_commit_sha,
    timestamp: safeInteger(row.timestamp_ms),
    numPassedTests: safeInteger(row.num_passed_tests),
    failedTests: safeInteger(row.failed_tests),
    numTotalTests: safeInteger(row.num_total_tests),
    coveragePercentage: row.coverage_percentage,
    success: row.success,
    testId: row.test_id === null ? null : safeInteger(row.test_id),
  };
}

async function saveCommit(client: PoolClient, id: string, incoming: CommitRecord) {
  const { rows } = await client.query<CommitRow>(
    "SELECT * FROM tdd_history.commits WHERE repository_id = $1 AND sha = $2",
    [id, incoming.sha],
  );
  // Normalize pg values and batch values into the same JS realm before comparing.
  const existing = rows[0] && structuredClone(commitRecord(rows[0]));
  const commit = existing ? mergeCommit(existing, incoming) : incoming;
  if (isDeepStrictEqual(existing, commit)) return "unchanged";

  await client.query(`
    INSERT INTO tdd_history.commits
      (repository_id, sha, parent_shas, message, committed_at, additions, deletions, total_changes, metrics)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (repository_id, sha) DO UPDATE SET
      parent_shas = EXCLUDED.parent_shas, committed_at = EXCLUDED.committed_at,
      additions = EXCLUDED.additions, deletions = EXCLUDED.deletions,
      total_changes = EXCLUDED.total_changes, metrics = EXCLUDED.metrics
  `, [id, commit.sha, commit.parentShas, commit.message, commit.committedAt,
    commit.stats?.additions ?? null, commit.stats?.deletions ?? null,
    commit.stats?.total ?? null, commit.metrics]);
  return existing ? "updated" : "added";
}

async function saveExecution(client: PoolClient, id: string, incoming: TestExecutionRecord) {
  const { rows } = await client.query<ExecutionRow>(
    "SELECT * FROM tdd_history.test_executions WHERE repository_id = $1 AND event_id = $2",
    [id, incoming.eventId],
  );
  const existing = rows[0] && structuredClone(executionRecord(rows[0]));
  const execution = existing ? mergeExecution(existing, incoming) : incoming;
  if (isDeepStrictEqual(existing, execution)) return "unchanged";

  await client.query(`
    INSERT INTO tdd_history.test_executions
      (repository_id, event_id, branch_at_capture, head_sha_at_execution, associated_commit_sha,
       timestamp_ms, num_passed_tests, failed_tests, num_total_tests, coverage_percentage, success, test_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (repository_id, event_id) DO UPDATE SET
      associated_commit_sha = EXCLUDED.associated_commit_sha,
      coverage_percentage = EXCLUDED.coverage_percentage, test_id = EXCLUDED.test_id
  `, [id, execution.eventId, execution.branchAtCapture, execution.headShaAtExecution,
    execution.associatedCommitSha, execution.timestamp, execution.numPassedTests,
    execution.failedTests, execution.numTotalTests, execution.coveragePercentage,
    execution.success, execution.testId]);
  return existing ? "updated" : "added";
}

export class PostgresTDDHistoryRepository implements ITDDHistoryRepository {
  constructor(private readonly pool: Pool) {}

  async saveBatch(input: TDDHistoryBatch): Promise<SaveSummary> {
    validateBatch(input);
    const batch = structuredClone(input);
    const client = await this.pool.connect();
    let discardClient = false;
    try {
      await client.query("BEGIN ISOLATION LEVEL READ COMMITTED");
      const identity = repositoryValues(batch.repository);
      const inserted = await client.query(`
        INSERT INTO tdd_history.repositories (provider, owner, name)
        VALUES ($1, $2, $3) ON CONFLICT (provider, owner, name) DO NOTHING
      `, identity);
      // Serialize read/merge/write cycles for the same repository.
      const { rows: [{ id }] } = await client.query<{ id: string }>(
        repositoryId + " FOR UPDATE", identity,
      );
      const summary = {
        repositoryCreated: inserted.rowCount === 1,
        branchesAdded: 0,
        commitsAdded: 0,
        commitsUpdated: 0,
        relationsAdded: 0,
        executionsAdded: 0,
        executionsUpdated: 0,
      };

      for (const { name } of batch.branches) {
        const result = await client.query(`
          INSERT INTO tdd_history.branches (repository_id, name)
          VALUES ($1, $2) ON CONFLICT (repository_id, name) DO NOTHING
        `, [id, name]);
        summary.branchesAdded += result.rowCount ?? 0;
      }
      for (const commit of batch.commits) {
        const result = await saveCommit(client, id, commit);
        if (result === "added") summary.commitsAdded++;
        if (result === "updated") summary.commitsUpdated++;
      }
      for (const { branchName, commitSha } of batch.branchCommits) {
        const result = await client.query(`
          INSERT INTO tdd_history.branch_commits (repository_id, branch_name, commit_sha)
          VALUES ($1, $2, $3) ON CONFLICT (repository_id, branch_name, commit_sha) DO NOTHING
        `, [id, branchName, commitSha]);
        summary.relationsAdded += result.rowCount ?? 0;
      }
      for (const execution of batch.executions) {
        const result = await saveExecution(client, id, execution);
        if (result === "added") summary.executionsAdded++;
        if (result === "updated") summary.executionsUpdated++;
      }
      await client.query("COMMIT");
      return summary;
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        discardClient = true;
      }
      if (typeof error === "object" && error !== null && "code" in error &&
          ["23503", "23514", "22008", "22021"].includes(String(error.code))) {
        throw new InvalidTDDHistoryBatchError("El lote infringe la integridad del historial TDD");
      }
      throw error;
    } finally {
      client.release(discardClient);
    }
  }

  async findRepository(repository: RepositoryKey): Promise<RepositoryKey | null> {
    const { rows } = await this.pool.query<RepositoryKey>(`
      SELECT provider, owner, name FROM tdd_history.repositories
      WHERE id = (${repositoryId})
    `, repositoryValues(repository));
    return rows[0] ?? null;
  }

  async listBranches(repository: RepositoryKey): Promise<BranchRecord[]> {
    const { rows } = await this.pool.query<{ name: string }>(`
      SELECT name FROM tdd_history.branches WHERE repository_id = (${repositoryId})
    `, repositoryValues(repository));
    return rows.sort((a, b) => a.name.localeCompare(b.name)).map(({ name }) => ({
      name,
      repository: structuredClone(repository),
    }));
  }

  async findCommit(repository: RepositoryKey, sha: string): Promise<CommitRecord | null> {
    const { rows } = await this.pool.query<CommitRow>(`
      SELECT * FROM tdd_history.commits WHERE repository_id = (${repositoryId}) AND sha = $4
    `, [...repositoryValues(repository), sha]);
    return rows[0] ? commitRecord(rows[0]) : null;
  }

  async listBranchCommits(repository: RepositoryKey, branchName: string): Promise<CommitRecord[]> {
    const { rows } = await this.pool.query<CommitRow>(`
      SELECT c.* FROM tdd_history.branch_commits AS bc
      JOIN tdd_history.commits AS c ON c.repository_id = bc.repository_id AND c.sha = bc.commit_sha
      WHERE bc.repository_id = (${repositoryId}) AND bc.branch_name = $4
      ORDER BY c.committed_at ASC NULLS LAST, c.sha COLLATE "C"
    `, [...repositoryValues(repository), branchName]);
    return rows.map(commitRecord);
  }

  async listExecutions(
    repository: RepositoryKey,
    filter: ExecutionFilter = { kind: "all" },
  ): Promise<TestExecutionRecord[]> {
    const values = repositoryValues(repository);
    let predicate = "";
    switch (filter.kind) {
      case "captured-in-branch":
        predicate = "AND e.branch_at_capture = $4";
        values.push(filter.branchName);
        break;
      case "associated-with-commit":
        predicate = "AND e.associated_commit_sha = $4";
        values.push(filter.sha);
        break;
      case "in-branch-history":
        predicate = `AND EXISTS (
          SELECT 1 FROM tdd_history.branch_commits AS bc
          WHERE bc.repository_id = e.repository_id AND bc.commit_sha = e.associated_commit_sha
            AND bc.branch_name = $4
        )`;
        values.push(filter.branchName);
        break;
    }
    const { rows } = await this.pool.query<ExecutionRow>(`
      SELECT e.* FROM tdd_history.test_executions AS e
      WHERE e.repository_id = (${repositoryId}) ${predicate}
    `, values);
    return rows.map(executionRecord).sort(
      (a, b) => a.timestamp - b.timestamp || a.eventId.localeCompare(b.eventId),
    );
  }
}
