import { CommitHistoryData } from "./ICommitHistoryData";

export interface BranchData {
  repository_slug: string;
  name: string;
  fork_commit_sha: string;
  created_at: Date;
  commit_count: number;
  last_commit_sha: string;
  last_commit_at: Date;
  merge_into: string;
}

export interface BranchHistoryData {
  branch: BranchData;
  commits: CommitHistoryData[];
}
