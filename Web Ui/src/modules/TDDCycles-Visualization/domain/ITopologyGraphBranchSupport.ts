export interface CommitGraphNodeBranchSupport {
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
  latest_conclusion?: "success" | "failure" | "cancelled" | "error" | null;
  latest_coverage?: number | null;
}

export interface CommitGraphEdgeBranchSupport {
  parent_sha: string;
  child_sha: string;
  parent_order: number;
}

export interface BranchSummaryBranchSupport {
  id: string;
  name: string;
  head_commit_sha?: string | null;
  fork_commit_sha?: string | null;
  created_at: Date;
  updated_at: Date;
  total_commits: number;
  is_default: boolean;
}

export interface TopologyGraphResponseBranchSupport {
  project_id: string;
  default_branch: string;
  branches: BranchSummaryBranchSupport[];
  nodes: CommitGraphNodeBranchSupport[];
  edges: CommitGraphEdgeBranchSupport[];
}
