import { MergeInfo } from "./IMergeInfo";
import { TddExecutionRequest } from "./InputModels";

export interface CommitHistoryData {
  repository_slug:string;
  branch: string;
  html_url: string;
  sha: string;
  parent_sha?: string;
  author?: string;
  stats: {
    total: number;
    additions: number;
    deletions: number;
    date: string;
  };
  commit: {
    date: Date;
    message: string;
    url: string;
    comment_count: number;
  };
  coverage: number;
  test_count: number;
  conclusion: string;
  merge?: MergeInfo;
  tddExecutions?: TddExecutionRequest[];
}
