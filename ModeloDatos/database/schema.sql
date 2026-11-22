CREATE SCHEMA "public";
CREATE ROLE "cloud_admin" WITH SUPERUSER CREATEDB CREATEROLE LOGIN REPLICATION BYPASSRLS;
CREATE ROLE "neon_service" WITH CREATEDB CREATEROLE LOGIN REPLICATION BYPASSRLS;
CREATE ROLE "neon_superuser" WITH CREATEDB CREATEROLE REPLICATION BYPASSRLS;
CREATE ROLE "neondb_owner" WITH CREATEDB CREATEROLE LOGIN REPLICATION BYPASSRLS;
CREATE ROLE "pg_checkpoint";
CREATE ROLE "pg_create_subscription";
CREATE ROLE "pg_database_owner";
CREATE ROLE "pg_execute_server_program";
CREATE ROLE "pg_maintain";
CREATE ROLE "pg_monitor";
CREATE ROLE "pg_read_all_data";
CREATE ROLE "pg_read_all_settings";
CREATE ROLE "pg_read_all_stats";
CREATE ROLE "pg_read_server_files";
CREATE ROLE "pg_signal_autovacuum_worker";
CREATE ROLE "pg_signal_backend";
CREATE ROLE "pg_stat_scan_tables";
CREATE ROLE "pg_use_reserved_connections";
CREATE ROLE "pg_write_all_data";
CREATE ROLE "pg_write_server_files";
CREATE ROLE "token_roles";
GRANT TRIGGER ON "tdd_branch" TO "neondb_owner" WITH GRANT OPTION;
GRANT REFERENCES ON "tdd_branch" TO "neondb_owner" WITH GRANT OPTION;
GRANT TRUNCATE ON "tdd_branch" TO "neondb_owner" WITH GRANT OPTION;
GRANT SELECT ON "tdd_branch" TO "neondb_owner" WITH GRANT OPTION;
GRANT INSERT ON "tdd_branch" TO "neondb_owner" WITH GRANT OPTION;
GRANT DELETE ON "tdd_branch" TO "neondb_owner" WITH GRANT OPTION;
GRANT UPDATE ON "tdd_branch" TO "neondb_owner" WITH GRANT OPTION;
GRANT DELETE ON "tdd_commit" TO "neondb_owner" WITH GRANT OPTION;
GRANT INSERT ON "tdd_commit" TO "neondb_owner" WITH GRANT OPTION;
GRANT SELECT ON "tdd_commit" TO "neondb_owner" WITH GRANT OPTION;
GRANT UPDATE ON "tdd_commit" TO "neondb_owner" WITH GRANT OPTION;
GRANT TRUNCATE ON "tdd_commit" TO "neondb_owner" WITH GRANT OPTION;
GRANT REFERENCES ON "tdd_commit" TO "neondb_owner" WITH GRANT OPTION;
GRANT TRIGGER ON "tdd_commit" TO "neondb_owner" WITH GRANT OPTION;
GRANT INSERT ON "tdd_execution" TO "neondb_owner" WITH GRANT OPTION;
GRANT TRIGGER ON "tdd_execution" TO "neondb_owner" WITH GRANT OPTION;
GRANT REFERENCES ON "tdd_execution" TO "neondb_owner" WITH GRANT OPTION;
GRANT TRUNCATE ON "tdd_execution" TO "neondb_owner" WITH GRANT OPTION;
GRANT DELETE ON "tdd_execution" TO "neondb_owner" WITH GRANT OPTION;
GRANT UPDATE ON "tdd_execution" TO "neondb_owner" WITH GRANT OPTION;
GRANT SELECT ON "tdd_execution" TO "neondb_owner" WITH GRANT OPTION;
GRANT DELETE ON "tdd_merge" TO "neondb_owner" WITH GRANT OPTION;
GRANT INSERT ON "tdd_merge" TO "neondb_owner" WITH GRANT OPTION;
GRANT SELECT ON "tdd_merge" TO "neondb_owner" WITH GRANT OPTION;
GRANT UPDATE ON "tdd_merge" TO "neondb_owner" WITH GRANT OPTION;
GRANT TRUNCATE ON "tdd_merge" TO "neondb_owner" WITH GRANT OPTION;
GRANT REFERENCES ON "tdd_merge" TO "neondb_owner" WITH GRANT OPTION;
GRANT TRIGGER ON "tdd_merge" TO "neondb_owner" WITH GRANT OPTION;
GRANT INSERT ON "tdd_schema_migration" TO "neondb_owner" WITH GRANT OPTION;
GRANT SELECT ON "tdd_schema_migration" TO "neondb_owner" WITH GRANT OPTION;
GRANT UPDATE ON "tdd_schema_migration" TO "neondb_owner" WITH GRANT OPTION;
GRANT DELETE ON "tdd_schema_migration" TO "neondb_owner" WITH GRANT OPTION;
GRANT TRUNCATE ON "tdd_schema_migration" TO "neondb_owner" WITH GRANT OPTION;
GRANT REFERENCES ON "tdd_schema_migration" TO "neondb_owner" WITH GRANT OPTION;
GRANT TRIGGER ON "tdd_schema_migration" TO "neondb_owner" WITH GRANT OPTION;
CREATE TABLE "tdd_repository"(
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "repos_name" varchar(255) NOT NULL,
  "repo_url" varchar(255) NOT NULL UNIQUE,
  "owner" varchar(255) NOT NULL
);
CREATE TABLE "tdd_branch" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text,
  "fork_commit_sha" text,
  "created_at" date,
  "repo_id" UUID REFERENCES "tdd_repository" ("id")
);
CREATE TABLE "tdd_commit" (
  "sha" text PRIMARY KEY,
  "parent_sha" text,
  "branch_id" UUID REFERENCES "tdd_branch" ("id"),
  "author" text,
  "message" text,
  "committed_at" text
);
CREATE TABLE "tdd_execution" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tdd_execution_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "commit_sha" text REFERENCES "tdd_commit" ("sha"),
  "tests_total" integer DEFAULT 0,
  "tests_passed" integer DEFAULT 0,
  "tests_failed" integer DEFAULT 0,
  "executed_at" date NOT NULL
);
CREATE TABLE "tdd_merge" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tdd_merge_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "source_branch_id" text NOT NULL REFERENCES "tdd_branch" ("id"),
  "target_branch_id" text NOT NULL REFERENCES "tdd_branch" ("id"),
  "source_commit_sha" text NOT NULL REFERENCES "tdd_commit" ("sha"),
  "merge_commit_sha" text NOT NULL REFERENCES "tdd_commit" ("sha"),
  "is_fast_forward" integer DEFAULT 0 NOT NULL,
  "merged_at" date NOT NULL
);
CREATE TABLE "tdd_schema_migration" (
  "version" integer PRIMARY KEY
);
CREATE UNIQUE INDEX "tdd_branch_pkey" ON "tdd_branch" ("id");
CREATE UNIQUE INDEX "tdd_repository_pkey" ON "tdd_branch" ("id");
CREATE UNIQUE INDEX "tdd_commit_pkey" ON "tdd_commit" ("sha");
CREATE INDEX "idx_tdd_execution_commit_sha" ON "tdd_execution" ("commit_sha");
CREATE INDEX "idx_tdd_execution_executed_at" ON "tdd_execution" ("executed_at");
CREATE UNIQUE INDEX "tdd_execution_pkey" ON "tdd_execution" ("id");
CREATE UNIQUE INDEX "tdd_merge_pkey" ON "tdd_merge" ("id");
CREATE UNIQUE INDEX "tdd_schema_migration_pkey" ON "tdd_schema_migration" ("version");
