BEGIN;
CREATE TABLE IF NOT EXISTS jobstable (
  id BIGSERIAL PRIMARY KEY,
  sha TEXT NOT NULL,
  owner TEXT NOT NULL,
  reponame TEXT NOT NULL,
  conclusion TEXT,
  branch TEXT
);
ALTER TABLE jobstable ADD COLUMN IF NOT EXISTS branch TEXT;
-- Intentionally fail on existing duplicates so migration never silently deletes evidence.
CREATE UNIQUE INDEX IF NOT EXISTS jobstable_repository_sha_unique ON jobstable (owner, reponame, sha);

-- Keep the complete JSON values, including additional fields, zeroes and timestamps.
-- One row per branch makes the two source files an atomic, idempotent snapshot.
CREATE TABLE IF NOT EXISTS tdd_result_snapshots (
  owner TEXT NOT NULL,
  reponame TEXT NOT NULL,
  branch TEXT NOT NULL,
  commit_history JSONB NOT NULL CHECK (jsonb_typeof(commit_history) = 'array'),
  tdd_log JSONB NOT NULL CHECK (jsonb_typeof(tdd_log) = 'array'),
  PRIMARY KEY (owner, reponame, branch)
);
COMMIT;
