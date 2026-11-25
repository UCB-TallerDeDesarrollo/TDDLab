export interface TDDCycleDataObject {
  html_url: string;
  stats: Stats;
  commit: Commit;
  sha: string;
  coverage: string;
  test_count: string;
  branch?: string;
  author?: string;
  stats_date?: string;
  failed_tests?: number;
  conclusion?: string;
  hook_timestamp?: number;
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
