BEGIN;

ALTER TABLE tdd_logs
  ADD COLUMN IF NOT EXISTS event_id TEXT,
  ADD COLUMN IF NOT EXISTS branch TEXT,
  ADD COLUMN IF NOT EXISTS coverage NUMERIC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tdd_logs_repository_event
  ON tdd_logs (lower(owner), lower(reponame), event_id)
  WHERE event_id IS NOT NULL;

-- Historical rows keep their original IDs; duplicated SHAs must be reviewed before migration.
CREATE UNIQUE INDEX IF NOT EXISTS idx_commitstable_repository_sha
  ON commitstable (lower(owner), lower(reponame), sha);

COMMIT;
