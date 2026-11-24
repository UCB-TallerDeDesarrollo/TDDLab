-- Baseline reconstruida a partir del esquema aplicado en Neon.
-- Ejecutar en una base nueva. Para una instalación existente sin registro,
-- verificar primero que coincide con esta baseline antes de adoptarla.
BEGIN;

-- Serializa la comprobación y aplicación de esta migración.
SELECT pg_advisory_xact_lock(18301, 1);

CREATE SCHEMA IF NOT EXISTS tdd_history_migrations;
CREATE TABLE IF NOT EXISTS tdd_history_migrations.applied (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1 FROM tdd_history_migrations.applied WHERE version = '001_create_tdd_history'
  ) THEN
    RETURN;
  END IF;

  CREATE SCHEMA tdd_history;

  CREATE OR REPLACE FUNCTION tdd_history.valid_parent_shas(child_sha text, parents text[])
   RETURNS boolean
   LANGUAGE sql
   IMMUTABLE PARALLEL SAFE
  AS $function$
      SELECT parents IS NULL OR (
        array_ndims(parents) = 1 OR cardinality(parents) = 0
      ) AND (
        SELECT COALESCE(bool_and(
          p IS NOT NULL AND
          p ~ '^[0-9a-f]{40}$|^[0-9a-f]{64}$' AND
          p <> child_sha
        ), TRUE)
        FROM unnest(parents) AS u(p)
      ) AND (
        SELECT count(*) = count(DISTINCT p)
        FROM unnest(parents) AS u(p)
      );
  $function$;

  CREATE TABLE tdd_history.repositories (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    provider text NOT NULL,
    owner text NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT repositories_identity_unique UNIQUE (provider, owner, name),
    CONSTRAINT repositories_name_nonempty CHECK ((length(btrim(name)) > 0)),
    CONSTRAINT repositories_owner_nonempty CHECK ((length(btrim(owner)) > 0)),
    CONSTRAINT repositories_pkey PRIMARY KEY (id),
    CONSTRAINT repositories_provider_nonempty CHECK ((length(btrim(provider)) > 0))
  );

  CREATE TABLE tdd_history.branches (
    repository_id bigint NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT branches_name_nonempty CHECK ((length(name) > 0)),
    CONSTRAINT branches_pk PRIMARY KEY (repository_id, name),
    CONSTRAINT branches_repo_fk FOREIGN KEY (repository_id) REFERENCES tdd_history.repositories(id)
  );

  CREATE TABLE tdd_history.commits (
    repository_id bigint NOT NULL,
    sha text NOT NULL,
    parent_shas text[],
    message text NOT NULL,
    committed_at timestamp(3) with time zone,
    additions bigint,
    deletions bigint,
    total_changes bigint,
    metrics jsonb,
    CONSTRAINT commits_metrics_object CHECK (((metrics IS NULL) OR (jsonb_typeof(metrics) = 'object'::text))),
    CONSTRAINT commits_parents_valid CHECK (tdd_history.valid_parent_shas(sha, parent_shas)),
    CONSTRAINT commits_pk PRIMARY KEY (repository_id, sha),
    CONSTRAINT commits_sha_format CHECK ((sha ~ '^[0-9a-f]{40}$|^[0-9a-f]{64}$'::text)),
    CONSTRAINT commits_stats_consistent CHECK ((((additions IS NULL) AND (deletions IS NULL) AND (total_changes IS NULL)) OR ((additions IS NOT NULL) AND (deletions IS NOT NULL) AND (total_changes IS NOT NULL) AND (additions >= 0) AND (deletions >= 0) AND (total_changes >= 0) AND (additions <= ('9223372036854775807'::bigint - deletions)) AND (total_changes = (additions + deletions))))),
    CONSTRAINT commits_repo_fk FOREIGN KEY (repository_id) REFERENCES tdd_history.repositories(id)
  );

  CREATE TABLE tdd_history.branch_commits (
    repository_id bigint NOT NULL,
    branch_name text NOT NULL,
    commit_sha text NOT NULL,
    CONSTRAINT branch_commits_pk PRIMARY KEY (repository_id, branch_name, commit_sha),
    CONSTRAINT branch_commits_branch_fk FOREIGN KEY (repository_id, branch_name) REFERENCES tdd_history.branches(repository_id, name),
    CONSTRAINT branch_commits_commit_fk FOREIGN KEY (repository_id, commit_sha) REFERENCES tdd_history.commits(repository_id, sha)
  );

  CREATE TABLE tdd_history.test_executions (
    repository_id bigint NOT NULL,
    event_id text NOT NULL,
    branch_at_capture text,
    head_sha_at_execution text,
    associated_commit_sha text,
    timestamp_ms bigint NOT NULL,
    num_passed_tests bigint NOT NULL,
    failed_tests bigint NOT NULL,
    num_total_tests bigint NOT NULL,
    coverage_percentage double precision,
    success boolean NOT NULL,
    test_id bigint,
    received_at timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT test_executions_counters_valid CHECK (((num_passed_tests >= 0) AND (failed_tests >= 0) AND (num_total_tests >= 0) AND (num_passed_tests <= num_total_tests) AND (failed_tests <= (num_total_tests - num_passed_tests)) AND ((NOT success) OR (failed_tests = 0)))),
    CONSTRAINT test_executions_coverage_valid CHECK (((coverage_percentage IS NULL) OR ((coverage_percentage >= (0)::double precision) AND (coverage_percentage <= (100)::double precision)))),
    CONSTRAINT test_executions_event_id_nonempty CHECK ((length(event_id) > 0)),
    CONSTRAINT test_executions_head_sha_format CHECK (((head_sha_at_execution IS NULL) OR (head_sha_at_execution ~ '^[0-9a-f]{40}$|^[0-9a-f]{64}$'::text))),
    CONSTRAINT test_executions_pk PRIMARY KEY (repository_id, event_id),
    CONSTRAINT test_executions_associated_commit_fk FOREIGN KEY (repository_id, associated_commit_sha) REFERENCES tdd_history.commits(repository_id, sha),
    CONSTRAINT test_executions_repo_fk FOREIGN KEY (repository_id) REFERENCES tdd_history.repositories(id)
  );

  CREATE INDEX commits_repo_time_idx ON tdd_history.commits USING btree (repository_id, committed_at, sha);

  CREATE INDEX test_executions_repo_associated_time_idx ON tdd_history.test_executions USING btree (repository_id, associated_commit_sha, timestamp_ms, event_id);

  CREATE INDEX test_executions_repo_capture_time_idx ON tdd_history.test_executions USING btree (repository_id, branch_at_capture, timestamp_ms, event_id);

  CREATE INDEX branch_commits_repo_commit_idx ON tdd_history.branch_commits USING btree (repository_id, commit_sha);

  INSERT INTO tdd_history_migrations.applied (version) VALUES ('001_create_tdd_history');
END;
$migration$;

COMMIT;
