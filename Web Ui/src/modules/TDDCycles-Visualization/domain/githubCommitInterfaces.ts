export interface CommitDataObject {
  html_url: string;
  stats: Stats;
  commit: Commit;
  sha: string;
  coverage: number;
  test_count: number;
}
export interface Stats {
  total: number;
  additions: number;
  deletions: number;
  date: string
}
export interface Commit {
  date: string;
  message: string;
  url: string;
  comment_count: number;
}
