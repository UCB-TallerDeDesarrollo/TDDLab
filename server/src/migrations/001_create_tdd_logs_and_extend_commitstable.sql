-- Migration 001: Extend commitstable and create tdd_logs table in Neon DB

-- 1. Extend commitstable
ALTER TABLE commitstable 
ADD COLUMN IF NOT EXISTS conclusion VARCHAR(50),
ADD COLUMN IF NOT EXISTS parents JSONB;

-- 2. Create tdd_logs table
CREATE TABLE IF NOT EXISTS tdd_logs (
    id SERIAL PRIMARY KEY,
    owner VARCHAR(100) NOT NULL,
    reponame VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'test_execution' | 'commit_event'
    test_id INT,
    commit_sha VARCHAR(100),
    commit_name TEXT,
    num_passed_tests INT,
    failed_tests INT,
    num_total_tests INT,
    timestamp BIGINT NOT NULL,
    success BOOLEAN,
    git_graph JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_tdd_logs_repo ON tdd_logs (owner, reponame);
CREATE INDEX IF NOT EXISTS idx_tdd_logs_commit ON tdd_logs (commit_sha);
