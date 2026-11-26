export interface CommitDataObject {
  html_url: string;
  stats: Stats;
  commit: Commit;
  sha: string;
  coverage: number;
  test_count: number;
  conclusion: string;
}
export interface Stats {
  total: number;
  additions: number;
  deletions: number;
}
export interface Commit {
  date: Date;
  message: string;
  url: string;
  comment_count: number;
}
export interface MergeInfo {
  source_branch: string;
  target_branch: string;
  is_fast_forward: boolean;
}
export interface CommitHistoryDTO {
  repository_slug: string;
  branch: string;
  html_url: string;
  sha: string;
  parent_sha?: string;
  author?: string;
  stats: Stats;
  commit: Commit;
  coverage: number;
  test_count: number;
  tests_passed: number;
  tests_failed: number;
  conclusion: string;
  merge?: MergeInfo;
  tddExecutions?: TddExecution[];
}

export interface TddExecution {
  testsTotal: number;
  testsPassed: number;
  testsFailed: number;
  executedAt: string;
}

export interface BranchDTO {
  repository_slug: string;
  name: string;
  fork_commit_sha: string;
  created_at: string;
  commit_count: number;
  last_commit_sha: string;
  last_commit_at: string;
  merge_into: string;
}

export interface BranchHistoryDTO {
  branch: BranchDTO;
  commits: CommitHistoryDTO[];
}

export interface MergeDTO {
  repository_slug: string;
  source_branch: string;
  target_branch: string;
  source_commit_sha: string;
  merge_commit_sha: string;
  is_fast_forward: boolean;
  merged_at: string;
}
