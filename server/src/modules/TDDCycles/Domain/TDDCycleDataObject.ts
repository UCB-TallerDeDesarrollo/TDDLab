export interface TDDCycleDataObject {
  repository_slug: string;
  branch: string;
  parent_sha?: string;
  html_url: string;
  stats: CommitHistoryStats;
  commit: Commit;
  sha: string;
  coverage: string;
  test_count: string;
  author?: string;
  test_passed: number;
  test_failed: number;
}
export interface CommitHistoryStats {
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
