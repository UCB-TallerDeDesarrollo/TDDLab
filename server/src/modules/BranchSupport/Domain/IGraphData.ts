import { ExecutionConclusion } from "./ITestExecution";

export interface CommitGraphNode {
  sha: string;
  author: string;
  author_email?: string | null;
  message: string;
  committed_at: Date;
  additions: number;
  deletions: number;
  total_changes: number;
  changed_files: number;
  branches: string[];
  parents: string[];
  test_runs_count: number;
  latest_conclusion?: ExecutionConclusion | null;
  latest_coverage?: number | null;
}

export interface CommitGraphEdge {
  parent_sha: string;
  child_sha: string;
  parent_order: number;
}

export interface BranchSummary {
  id: string;
  name: string;
  head_commit_sha?: string | null;
  fork_commit_sha?: string | null;
  created_at: Date;
  updated_at: Date;
  total_commits: number;
  latest_execution?: {
    id: string;
    conclusion: ExecutionConclusion;
    total_tests: number;
    passed_tests: number;
    failed_tests: number;
    coverage?: number | null;
    executed_at: Date;
  } | null;
}

export interface TopologyGraphResponse {
  project_id: string;
  branches: BranchSummary[];
  nodes: CommitGraphNode[];
  edges: CommitGraphEdge[];
}

export interface TestMetricPoint {
  execution_id: string;
  branch_id?: string | null;
  branch_name?: string | null;
  commit_sha?: string | null;
  source: string;
  executed_at: Date;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  error_tests: number;
  coverage?: number | null;
  duration_ms?: number | null;
  conclusion: ExecutionConclusion;
}

export interface TestMetricsGraphResponse {
  project_id: string;
  timeline: TestMetricPoint[];
  branch_summaries: Record<
    string,
    {
      branch_name: string;
      total_runs: number;
      passed_runs: number;
      failed_runs: number;
      latest_coverage?: number | null;
    }
  >;
}

export interface TDDCyclePoint {
  commit_sha: string;
  committed_at: Date;
  message: string;
  additions: number;
  deletions: number;
  total_changes: number;
  test_conclusion?: ExecutionConclusion | null;
  passed_tests?: number;
  failed_tests?: number;
  coverage?: number | null;
  phase_hint?: "red" | "green" | "refactor" | "unknown";
}
