BEGIN;

ALTER TABLE commitstable ADD COLUMN IF NOT EXISTS superseded BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS tdd_execution_commits (
    owner TEXT NOT NULL,
    reponame TEXT NOT NULL,
    event_id TEXT NOT NULL,
    commit_sha TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (owner, reponame, event_id, commit_sha)
);

INSERT INTO tdd_execution_commits (owner, reponame, event_id, commit_sha)
SELECT lower(owner), lower(reponame), event_id, commit_sha FROM tdd_logs
WHERE type = 'test_execution' AND event_id IS NOT NULL AND commit_sha IS NOT NULL
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS tdd_commit_rewrites (
    owner TEXT NOT NULL,
    reponame TEXT NOT NULL,
    rewrite_id UUID NOT NULL,
    old_sha TEXT NOT NULL,
    new_sha TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (owner, reponame, rewrite_id, old_sha, new_sha),
    CHECK (old_sha <> new_sha)
);

CREATE INDEX IF NOT EXISTS idx_tdd_execution_commits_sha
ON tdd_execution_commits (owner, reponame, commit_sha);
CREATE INDEX IF NOT EXISTS idx_tdd_commit_rewrites_source
ON tdd_commit_rewrites (owner, reponame, old_sha);

CREATE OR REPLACE VIEW tdd_current_commits AS
SELECT c.* FROM commitstable c
WHERE NOT c.superseded OR EXISTS (
    SELECT 1 FROM tdd_logs l WHERE lower(l.owner) = lower(c.owner) AND lower(l.reponame) = lower(c.reponame)
      AND l.type = 'test_execution' AND l.event_id IS NOT NULL AND l.commit_sha = c.sha
);

CREATE OR REPLACE VIEW tdd_commit_metrics AS
SELECT * FROM tdd_current_commits WHERE test_count IS NOT NULL;

CREATE OR REPLACE VIEW tdd_current_logs AS
SELECT l.* FROM tdd_logs l LEFT JOIN tdd_current_commits c
  ON lower(c.owner) = lower(l.owner) AND lower(c.reponame) = lower(l.reponame) AND c.sha = l.commit_sha
WHERE l.event_id IS NULL OR (l.commit_sha IS NOT NULL AND c.sha IS NOT NULL);

COMMIT;
