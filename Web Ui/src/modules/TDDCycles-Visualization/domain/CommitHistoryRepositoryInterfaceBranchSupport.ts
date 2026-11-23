import { CommitDataObjectBranchSupport } from "./githubCommitInterfacesBranchSupport";
import { CommitCycleBranchSupport } from "./TddCycleInterfaceBranchSupport";

export interface CommitHistoryRepositoryBranchSupport {
  obtainCommitsOfRepo(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitDataObjectBranchSupport[]>;

  obtainCommitTddCycle(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitCycleBranchSupport[]>;

  obtainProjectBranches(
    owner: string,
    repoName: string
  ): Promise<string[]>;
}
