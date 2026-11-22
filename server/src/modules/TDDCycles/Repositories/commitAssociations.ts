import { TDDEventBatch, TDDCommitEvent, TDDEventConflictError } from "../Domain/TDDEvents";
import { TDDDatabaseClient } from "./TDDDatabase";

interface Association { event_id: string; commit_sha: string | null }

export async function associateCommit(client: TDDDatabaseClient, batch: TDDEventBatch, commit: TDDCommitEvent) {
  const scope = [batch.owner, batch.repoName];
  const rewrite = commit.rewrite;
  const requested = await client.query<Association>(`
    SELECT event_id, commit_sha FROM tdd_logs
    WHERE lower(owner) = $1 AND lower(reponame) = $2
      AND type = 'test_execution' AND event_id = ANY($3::text[])
  `, [...scope, commit.executionIds]);
  if (requested.rows.length !== commit.executionIds.length) {
    throw new TDDEventConflictError("Send the executions before their commit");
  }
  const archived = await client.query(`
    SELECT event_id FROM tdd_execution_commits
    WHERE owner = $1 AND reponame = $2 AND commit_sha = $3 AND event_id = ANY($4::text[])
  `, [...scope, commit.sha, commit.executionIds]);
  const knownVersion = archived.rows.length === commit.executionIds.length;
  const target = await client.query<{ superseded: boolean; recorded: boolean }>(`
    SELECT superseded, EXISTS (SELECT 1 FROM tdd_logs
      WHERE lower(owner) = $1 AND lower(reponame) = $2 AND event_id = 'commit:' || $3) AS recorded
    FROM commitstable WHERE lower(owner) = $1 AND lower(reponame) = $2 AND sha = $3
  `, [...scope, commit.sha]);
  const mismatch = requested.rows.some(run => run.commit_sha !== null && run.commit_sha !== commit.sha);

  if (rewrite) {
    const applied = await client.query<{ old_sha: string }>(`
      SELECT old_sha FROM tdd_commit_rewrites
      WHERE owner = $1 AND reponame = $2 AND rewrite_id = $3 AND new_sha = $4
    `, [...scope, rewrite.id, commit.sha]);
    if (applied.rows.length) {
      if (!knownVersion || applied.rows.length !== rewrite.from.length
        || applied.rows.some(row => !rewrite.from.includes(row.old_sha))) {
        throw new TDDEventConflictError("A rewrite ID already has different recorded data");
      }
      return false;
    }
    const sources = await client.query(`
      SELECT sha FROM commitstable WHERE lower(owner) = $1 AND lower(reponame) = $2 AND sha = ANY($3::text[])
    `, [...scope, rewrite.from]);
    if (sources.rows.length !== rewrite.from.length) {
      throw new TDDEventConflictError("Send the original commits before their rewrite");
    }
    const stale = await client.query(`
      SELECT c.sha FROM commitstable c
      WHERE lower(c.owner) = $1 AND lower(c.reponame) = $2 AND c.sha = ANY($3::text[]) AND c.superseded
        AND EXISTS (SELECT 1 FROM tdd_execution_commits h
          WHERE h.owner = $1 AND h.reponame = $2 AND h.commit_sha = c.sha)
        AND NOT EXISTS (SELECT 1 FROM tdd_logs l WHERE lower(l.owner) = $1 AND lower(l.reponame) = $2
          AND l.type = 'test_execution' AND l.event_id IS NOT NULL AND l.commit_sha = c.sha)
        AND NOT EXISTS (SELECT 1 FROM tdd_commit_rewrites r
          WHERE r.owner = $1 AND r.reponame = $2 AND r.rewrite_id = $4 AND r.old_sha = c.sha)
    `, [...scope, rewrite.from, rewrite.id]);
    const alreadyCurrent = knownVersion && !target.rows[0].superseded
      && requested.rows.every(run => run.commit_sha === commit.sha);
    if (stale.rows.length && !alreadyCurrent) {
      throw new TDDEventConflictError("The original version was already rewritten; synchronize Git first");
    }
    if (requested.rows.some(run => run.commit_sha !== null && run.commit_sha !== commit.sha
      && !rewrite.from.includes(run.commit_sha))) {
      throw new TDDEventConflictError("A concurrent rewrite changed an execution association");
    }
  } else {
    if (target.rows[0].recorded && knownVersion) return false;
    if (target.rows[0].superseded || mismatch) {
      throw new TDDEventConflictError("An execution already belongs to another commit; send its Git rewrite");
    }
  }

  await client.query(`
    INSERT INTO tdd_execution_commits (owner, reponame, event_id, commit_sha)
    SELECT $1, $2, event_id, commit_sha FROM tdd_logs
    WHERE lower(owner) = $1 AND lower(reponame) = $2 AND type = 'test_execution'
      AND event_id = ANY($3::text[]) AND commit_sha IS NOT NULL
    ON CONFLICT DO NOTHING
  `, [...scope, commit.executionIds]);
  await client.query(`
    INSERT INTO tdd_execution_commits (owner, reponame, event_id, commit_sha)
    SELECT $1, $2, unnest($3::text[]), $4 ON CONFLICT DO NOTHING
  `, [...scope, commit.executionIds, commit.sha]);
  await client.query(`
    UPDATE tdd_logs SET commit_sha = $3
    WHERE lower(owner) = $1 AND lower(reponame) = $2 AND type = 'test_execution' AND event_id = ANY($4::text[])
  `, [...scope, commit.sha, commit.executionIds]);

  if (rewrite) {
    await client.query(`
      INSERT INTO tdd_commit_rewrites (owner, reponame, rewrite_id, old_sha, new_sha)
      SELECT $1, $2, $3::uuid, unnest($4::text[]), $5 ON CONFLICT DO NOTHING
    `, [...scope, rewrite.id, rewrite.from, commit.sha]);
    await client.query(`
      UPDATE commitstable c SET superseded = TRUE
      WHERE lower(c.owner) = $1 AND lower(c.reponame) = $2 AND c.sha = ANY($3::text[])
        AND (c.test_count IS NULL OR EXISTS (SELECT 1 FROM tdd_execution_commits h
          WHERE h.owner = $1 AND h.reponame = $2 AND h.commit_sha = c.sha))
    `, [...scope, rewrite.from]);
    await client.query(`
      UPDATE commitstable SET superseded = FALSE WHERE lower(owner) = $1 AND lower(reponame) = $2 AND sha = $3
    `, [...scope, commit.sha]);
  }
  return true;
}
