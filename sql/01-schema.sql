-- ============================================================
-- TDDLab - Schema local para testing (Podman/PostgreSQL)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Dominio: Groups
-- ============================================================
CREATE TABLE IF NOT EXISTS "Groups" (
    id SERIAL PRIMARY KEY,
    groupname VARCHAR(255) NOT NULL,
    groupdetail TEXT,
    creationdate TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Dominio: Users
-- ============================================================
CREATE TABLE IF NOT EXISTS userstable (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    groupid INTEGER REFERENCES "Groups"(id),
    role VARCHAR(50) NOT NULL DEFAULT 'student'
);

CREATE TABLE IF NOT EXISTS usersTable (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    groupid INTEGER REFERENCES "Groups"(id),
    role VARCHAR(50) NOT NULL DEFAULT 'student'
);

-- ============================================================
-- Dominio: Practices
-- ============================================================
CREATE TABLE IF NOT EXISTS practices (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creation_date TIMESTAMP,
    state VARCHAR(50) NOT NULL DEFAULT 'pending',
    userid INTEGER NOT NULL REFERENCES userstable(id)
);

-- ============================================================
-- Dominio: Assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    state VARCHAR(50) NOT NULL DEFAULT 'pending',
    link TEXT,
    comment TEXT,
    groupid INTEGER NOT NULL REFERENCES "Groups"(id),
    practice_id VARCHAR(255)
);

-- ============================================================
-- Dominio: Submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    assignmentid INTEGER NOT NULL REFERENCES assignments(id),
    userid INTEGER NOT NULL REFERENCES userstable(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    repository_link TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    comment TEXT
);

-- ============================================================
-- Dominio: Deliveries (referenciado en borrado de assignments)
-- ============================================================
CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY,
    assignmentid INTEGER NOT NULL REFERENCES assignments(id),
    userid INTEGER NOT NULL REFERENCES userstable(id),
    delivered_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Dominio: PracticeSubmissions
-- ============================================================
CREATE TABLE IF NOT EXISTS practicesubmissions (
    id SERIAL PRIMARY KEY,
    practiceid INTEGER NOT NULL REFERENCES practices(id),
    userid INTEGER NOT NULL REFERENCES userstable(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    repository_link TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    comment TEXT
);

-- ============================================================
-- Dominio: TeacherComments
-- ============================================================
CREATE TABLE IF NOT EXISTS "TeacherComments" (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(id),
    teacher_id INTEGER NOT NULL REFERENCES userstable(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Dominio: FeatureFlags
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_flags (
    id SERIAL PRIMARY KEY,
    feature_name VARCHAR(255) UNIQUE NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
-- Dominio: Prompts IA
-- ============================================================
CREATE TABLE IF NOT EXISTS prompts_ia_temp_v2 (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    prompt TEXT NOT NULL
);

-- ============================================================
-- Dominio: TDDCycles - Commits
-- ============================================================
CREATE TABLE IF NOT EXISTS commitsTable (
    id SERIAL PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    repoName VARCHAR(255) NOT NULL,
    html_url TEXT,
    sha VARCHAR(255) NOT NULL,
    total INTEGER DEFAULT 0,
    additions INTEGER DEFAULT 0,
    deletions INTEGER DEFAULT 0,
    message TEXT,
    url TEXT,
    comment_count INTEGER DEFAULT 0,
    commit_date TIMESTAMP,
    coverage VARCHAR(50),
    test_count VARCHAR(50) DEFAULT '',
    tdd_cycle VARCHAR(50)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_commits_owner_repo_sha
    ON commitsTable (owner, repoName, sha);

-- ============================================================
-- Dominio: TDDCycles - Jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS jobsTable (
    id INTEGER PRIMARY KEY,
    sha VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    repoName VARCHAR(255) NOT NULL,
    conclusion VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_jobs_owner_repo
    ON jobsTable (owner, repoName);

-- ============================================================
-- Dominio: TDDCycles - Commit Timeline
-- ============================================================
CREATE TABLE IF NOT EXISTS commit_timeline (
    id SERIAL PRIMARY KEY,
    commit_sha VARCHAR(255) NOT NULL,
    execution_timestamp TIMESTAMP NOT NULL,
    number_of_tests INTEGER NOT NULL,
    passed_tests INTEGER NOT NULL,
    color VARCHAR(20) NOT NULL,
    repoOwner VARCHAR(255) NOT NULL,
    repoName VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_timeline_commit_sha
    ON commit_timeline (commit_sha);

-- ============================================================
-- Datos semilla mínimos para testing
-- ============================================================
INSERT INTO "Groups" (groupname, groupdetail, creationdate)
VALUES ('Grupo Test', 'Grupo de prueba para testing', NOW())
ON CONFLICT DO NOTHING;

INSERT INTO userstable (email, groupid, role)
VALUES ('test@test.com', 1, 'student')
ON CONFLICT DO NOTHING;

INSERT INTO feature_flags (feature_name, is_enabled)
VALUES ('test_flag', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO prompts_ia_temp_v2 (name, prompt)
VALUES ('tdd_analysis', 'Eres un experto en TDD.')
ON CONFLICT DO NOTHING;
