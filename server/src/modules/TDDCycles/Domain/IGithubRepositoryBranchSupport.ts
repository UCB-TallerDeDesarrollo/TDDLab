import { CommitHistoryDataBranchSupport } from "./ICommitHistoryDataBranchSupport";
import { CommitCycleDataBranchSupport } from "./ICommitCycleDataBranchSupport";

export interface IGithubRepositoryBranchSupport {
  getCommitHistoryData(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitHistoryDataBranchSupport[]>;

  getCommitCyclesData(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitCycleDataBranchSupport[]>;

  getProjectBranches(
    owner: string,
    repoName: string
  ): Promise<string[]>;
}
