import { TDDEventBatch, TDDCommitEvent, TDDExecutionEvent, TDDEventConflictError } from "../Domain/TDDEvents";
import { TDDDatabaseClient } from "./TDDDatabase";
import { associateCommit } from "./commitAssociations";

interface StoredExecution {
  event_id: string;
  commit_sha: string | null;
  branch: string | null;
  num_total_tests: number;
  success: boolean;
  coverage: string | null;
}

type CommitLogMetadata = Pick<TDDCommitEvent, "sha" | "message" | "parents" | "timestamp" | "branch">;

function inSequence<T>(items: T[], operation: (item: T) => Promise<void>): Promise<void> {
  // A single transaction must finish each write before starting its dependent writes.
  return items.reduce((pending, item) => pending.then(() => operation(item)), Promise.resolve());
}

function getCommitOutcome(last: StoredExecution, runs: StoredExecution[]) {
  if (last.num_total_tests === 0) return { conclusion: "neutral", cycle: null };
  if (!last.success) return { conclusion: "failure", cycle: "Rojo" };
  return { conclusion: "success", cycle: runs.some(run => !run.success) ? "RojoVerde" : "Verde" };
}

function getBranchContext(runs: StoredExecution[], branch: string | undefined) {
  const branches = [...new Set(runs.flatMap(run => run.branch ? [run.branch] : []))]
    .sort((left, right) => left.localeCompare(right));
  if (branches.length) return { recordedBranches: branches };
  if (branch) return { historyBranch: branch };
  return {};
}

async function storeExecution(client: TDDDatabaseClient, batch: TDDEventBatch, run: TDDExecutionEvent) {
  const result = await client.query(`
    INSERT INTO tdd_logs
      (owner, reponame, type, event_id, branch, num_passed_tests, failed_tests,
       num_total_tests, timestamp, success, coverage)
    VALUES ($1, $2, 'test_execution', $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (lower(owner), lower(reponame), event_id) WHERE event_id IS NOT NULL
    DO UPDATE SET event_id = tdd_logs.event_id
    WHERE tdd_logs.type = 'test_execution' AND
      (tdd_logs.branch, tdd_logs.num_passed_tests, tdd_logs.failed_tests,
       tdd_logs.num_total_tests, tdd_logs.timestamp, tdd_logs.success, tdd_logs.coverage)
      IS NOT DISTINCT FROM
      (EXCLUDED.branch, EXCLUDED.num_passed_tests, EXCLUDED.failed_tests,
       EXCLUDED.num_total_tests, EXCLUDED.timestamp, EXCLUDED.success, EXCLUDED.coverage)
    RETURNING id
  `, [batch.owner, batch.repoName, run.eventId, run.branch ?? null, run.numPassedTests,
    run.failedTests, run.numTotalTests, run.timestamp, run.success, run.coverage]);
  if (result.rows.length !== 1) {
    throw new TDDEventConflictError("An execution ID already has different recorded data");
  }
}

async function storeCommit(client: TDDDatabaseClient, batch: TDDEventBatch, commit: TDDCommitEvent) {
  const url = `https://github.com/${batch.owner}/${batch.repoName}/commit/${commit.sha}`;
  const saved = await client.query(`
    INSERT INTO commitstable
      (owner, reponame, sha, html_url, url, message, commit_date, total, additions, deletions, parents)
    VALUES ($1, $2, $3, $4, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (lower(owner), lower(reponame), sha) DO UPDATE SET
      html_url = EXCLUDED.html_url, url = EXCLUDED.url, message = EXCLUDED.message,
      commit_date = EXCLUDED.commit_date, total = EXCLUDED.total,
      additions = EXCLUDED.additions, deletions = EXCLUDED.deletions, parents = EXCLUDED.parents
    WHERE NOT EXISTS (
      SELECT 1 FROM tdd_logs
      WHERE lower(owner) = $1 AND lower(reponame) = $2 AND event_id = 'commit:' || $3
    ) OR
      (commitstable.message, commitstable.commit_date, commitstable.total,
       commitstable.additions, commitstable.deletions, commitstable.parents)
      IS NOT DISTINCT FROM
      (EXCLUDED.message, EXCLUDED.commit_date, EXCLUDED.total,
       EXCLUDED.additions, EXCLUDED.deletions, EXCLUDED.parents)
    RETURNING id
  `, [batch.owner, batch.repoName, commit.sha, url, commit.message, new Date(commit.timestamp),
    commit.stats.total, commit.stats.additions, commit.stats.deletions, JSON.stringify(commit.parents)]);
  if (saved.rows.length !== 1) {
    throw new TDDEventConflictError("A commit SHA already has different recorded metadata");
  }

  if (!await associateCommit(client, batch, commit)) return;
  await refreshCommit(client, batch, commit);
  if (commit.rewrite) {
    const sources = await client.query<CommitLogMetadata>(`
      SELECT sha, message, parents, EXTRACT(EPOCH FROM commit_date) * 1000 AS timestamp
      FROM commitstable WHERE lower(owner) = $1 AND lower(reponame) = $2 AND sha = ANY($3::text[])
    `, [batch.owner, batch.repoName, commit.rewrite.from]);
    await inSequence(sources.rows, source =>
      refreshCommit(client, batch, { ...source, timestamp: Number(source.timestamp) }));
  }
}

async function refreshCommit(client: TDDDatabaseClient, batch: TDDEventBatch, commit: CommitLogMetadata) {
  const runs = await client.query<StoredExecution>(`
    SELECT event_id, branch, num_total_tests, success, coverage FROM tdd_logs
    WHERE lower(owner) = $1 AND lower(reponame) = $2 AND type = 'test_execution' AND commit_sha = $3
    ORDER BY timestamp, event_id
  `, [batch.owner, batch.repoName, commit.sha]);
  const last = runs.rows.at(-1);
  if (last) {
    const { conclusion, cycle } = getCommitOutcome(last, runs.rows);
    await client.query(`
      UPDATE commitstable SET coverage = $4, test_count = $5, conclusion = $6, tdd_cycle = $7
      WHERE lower(owner) = $1 AND lower(reponame) = $2 AND sha = $3
    `, [batch.owner, batch.repoName, commit.sha, last.coverage, last.num_total_tests, conclusion, cycle]);
  } else {
    // Legacy metrics without execution UUIDs retain their original meaning.
    await client.query(`
      UPDATE commitstable c SET coverage = NULL, test_count = NULL, conclusion = NULL, tdd_cycle = NULL
      WHERE lower(c.owner) = $1 AND lower(c.reponame) = $2 AND c.sha = $3
        AND EXISTS (SELECT 1 FROM tdd_execution_commits h
          WHERE h.owner = $1 AND h.reponame = $2 AND h.commit_sha = c.sha)
    `, [batch.owner, batch.repoName, commit.sha]);
  }

  const [subject, ...body] = commit.message.split("\n");
  const messageBody = body.join("\n").trim();
  const graph = [{
    sha: commit.sha, parents: commit.parents, subject, timestamp: commit.timestamp,
    ...(messageBody ? { body: messageBody } : {}),
    ...getBranchContext(runs.rows, commit.branch),
  }];
  await client.query(`
    INSERT INTO tdd_logs (owner, reponame, type, event_id, commit_sha, commit_name, timestamp, branch, git_graph)
    VALUES ($1, $2, 'commit_event', $3, $4, $5, $6, $7, $8)
    ON CONFLICT (lower(owner), lower(reponame), event_id) WHERE event_id IS NOT NULL
    DO UPDATE SET git_graph = EXCLUDED.git_graph
  `, [batch.owner, batch.repoName, `commit:${commit.sha}`, commit.sha, commit.message,
    commit.timestamp, commit.branch ?? null, JSON.stringify(graph)]);
}

export async function storeTDDEvents(client: TDDDatabaseClient, batch: TDDEventBatch) {
  // Serializing one repository keeps concurrent clones from assigning an execution twice.
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [`${batch.owner}/${batch.repoName}`]);
  await inSequence(batch.executions, run => storeExecution(client, batch, run));
  await inSequence(batch.commits, commit => storeCommit(client, batch, commit));
}
