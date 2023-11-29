export interface CommitDTO {
  html_url: string;
  stats: Stats;
  commit: Commit;
  sha: string;
  coverage: string;
  testCount: string;
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
