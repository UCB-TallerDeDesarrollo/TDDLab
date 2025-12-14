import { ITestRun } from "./ITestRun";

export interface CommitDataObject {
  html_url: string;
  stats: Stats;
  commit: Commit;
  sha: string;
  coverage: number;
  test_count: number;
  conclusion: string;
  test_run?: ITestRun;
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
