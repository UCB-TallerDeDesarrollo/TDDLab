-- ==========================================
-- TDDLab - Branch Support & Neon PostgreSQL
-- ==========================================

-- 1. PROJECT
CREATE TABLE IF NOT EXISTS project (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    link TEXT NOT NULL,
    github_user VARCHAR(39) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_project_user_link
        UNIQUE (github_user, link)
);

-- 2. GIT_COMMIT
CREATE TABLE IF NOT EXISTS git_commit (
    project_id BIGINT NOT NULL,
    sha VARCHAR(40) NOT NULL,
    author VARCHAR(255) NOT NULL,
    author_email VARCHAR(255),
    message TEXT NOT NULL,
    committed_at TIMESTAMPTZ NOT NULL,
    additions INTEGER NOT NULL DEFAULT 0,
    deletions INTEGER NOT NULL DEFAULT 0,
    total_changes INTEGER GENERATED ALWAYS AS (additions + deletions) STORED,
    changed_files INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (project_id, sha),

    CONSTRAINT fk_commit_project
        FOREIGN KEY (project_id)
        REFERENCES project(id)
        ON DELETE CASCADE,

    CONSTRAINT ck_commit_stats
        CHECK (
            additions >= 0 AND
            deletions >= 0 AND
            changed_files >= 0
        )
);

-- 3. BRANCH
CREATE TABLE IF NOT EXISTS branch (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    head_commit_sha VARCHAR(40),
    fork_commit_sha VARCHAR(40),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT fk_branch_project
        FOREIGN KEY (project_id)
        REFERENCES project(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_branch_id_project
        UNIQUE (id, project_id),

    CONSTRAINT uq_branch_name
        UNIQUE (project_id, name),

    CONSTRAINT fk_branch_head_commit
        FOREIGN KEY (project_id, head_commit_sha)
        REFERENCES git_commit(project_id, sha)
        ON DELETE RESTRICT,

    CONSTRAINT fk_branch_fork_commit
        FOREIGN KEY (project_id, fork_commit_sha)
        REFERENCES git_commit(project_id, sha)
        ON DELETE RESTRICT
);

-- Function & trigger for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_branch_updated_at'
    ) THEN
        CREATE TRIGGER trg_branch_updated_at
            BEFORE UPDATE ON branch
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- 4. BRANCH_COMMIT
CREATE TABLE IF NOT EXISTS branch_commit (
    branch_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    commit_sha VARCHAR(40) NOT NULL,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (branch_id, commit_sha),

    CONSTRAINT fk_branch_commit_branch
        FOREIGN KEY (branch_id, project_id)
        REFERENCES branch(id, project_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_branch_commit_commit
        FOREIGN KEY (project_id, commit_sha)
        REFERENCES git_commit(project_id, sha)
        ON DELETE RESTRICT
);

-- 5. COMMIT_PARENT
CREATE TABLE IF NOT EXISTS commit_parent (
    project_id BIGINT NOT NULL,
    commit_sha VARCHAR(40) NOT NULL,
    parent_sha VARCHAR(40) NOT NULL,
    parent_order SMALLINT NOT NULL,

    PRIMARY KEY (project_id, commit_sha, parent_sha),

    CONSTRAINT fk_commit_parent_child
        FOREIGN KEY (project_id, commit_sha)
        REFERENCES git_commit(project_id, sha)
        ON DELETE CASCADE,

    CONSTRAINT uq_commit_parent_order
        UNIQUE (project_id, commit_sha, parent_order),

    CONSTRAINT ck_commit_parent_order
        CHECK (parent_order >= 1),

    CONSTRAINT ck_commit_not_own_parent
        CHECK (commit_sha <> parent_sha)
);

-- 6. TEST_EXECUTION
CREATE TABLE IF NOT EXISTS test_execution (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT NOT NULL,
    branch_id BIGINT,
    commit_sha VARCHAR(40),
    source VARCHAR(10) NOT NULL DEFAULT 'local',

    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    total_tests INTEGER NOT NULL DEFAULT 0,
    passed_tests INTEGER NOT NULL DEFAULT 0,
    failed_tests INTEGER NOT NULL DEFAULT 0,
    skipped_tests INTEGER NOT NULL DEFAULT 0,
    error_tests INTEGER NOT NULL DEFAULT 0,

    coverage NUMERIC(5,2),
    covered_lines INTEGER,
    total_lines INTEGER,
    covered_branches INTEGER,
    total_branches INTEGER,

    duration_ms BIGINT,
    conclusion VARCHAR(20) NOT NULL,

    CONSTRAINT fk_execution_project
        FOREIGN KEY (project_id)
        REFERENCES project(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_execution_branch
        FOREIGN KEY (branch_id, project_id)
        REFERENCES branch(id, project_id)
        ON DELETE SET NULL (branch_id),

    CONSTRAINT fk_execution_commit
        FOREIGN KEY (project_id, commit_sha)
        REFERENCES git_commit(project_id, sha)
        ON DELETE RESTRICT,

    CONSTRAINT ck_execution_source
        CHECK (source IN ('local', 'ci')),

    CONSTRAINT ck_execution_counts
        CHECK (
            total_tests >= 0 AND
            passed_tests >= 0 AND
            failed_tests >= 0 AND
            skipped_tests >= 0 AND
            error_tests >= 0 AND
            total_tests = passed_tests
                + failed_tests
                + skipped_tests
                + error_tests
        ),

    CONSTRAINT ck_execution_coverage
        CHECK (
            coverage IS NULL OR
            coverage BETWEEN 0 AND 100
        ),

    CONSTRAINT ck_execution_conclusion
        CHECK (conclusion IN (
            'success',
            'failure',
            'cancelled',
            'error'
        ))
);

-- 7. TEST_RESULT
CREATE TABLE IF NOT EXISTS test_result (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    execution_id BIGINT NOT NULL,

    test_name VARCHAR(500) NOT NULL,
    test_full_name TEXT,
    file_path TEXT,

    status VARCHAR(20) NOT NULL,
    duration_ms BIGINT,
    error_message TEXT,

    CONSTRAINT fk_result_execution
        FOREIGN KEY (execution_id)
        REFERENCES test_execution(id)
        ON DELETE CASCADE,

    CONSTRAINT ck_test_result_status
        CHECK (status IN (
            'passed',
            'failed',
            'skipped',
            'error'
        ))
);

-- 8. INDEXES
CREATE INDEX IF NOT EXISTS idx_commit_project_date
    ON git_commit (project_id, committed_at);

CREATE INDEX IF NOT EXISTS idx_commit_parent_parent
    ON commit_parent (project_id, parent_sha);

CREATE INDEX IF NOT EXISTS idx_branch_commit_commit
    ON branch_commit (project_id, commit_sha);

CREATE INDEX IF NOT EXISTS idx_execution_commit_date
    ON test_execution (project_id, commit_sha, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_execution_project_date
    ON test_execution (project_id, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_execution_branch_date
    ON test_execution (branch_id, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_result_execution
    ON test_result (execution_id);
