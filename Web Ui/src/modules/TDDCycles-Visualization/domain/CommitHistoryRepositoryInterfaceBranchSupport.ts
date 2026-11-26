import { CommitDataObjectBranchSupport } from "./githubCommitInterfacesBranchSupport";
import { CommitCycleBranchSupport } from "./TddCycleInterfaceBranchSupport";
import { TestExecutionDataBranchSupport } from "./ITestExecutionDataBranchSupport";
import { TopologyGraphResponseBranchSupport } from "./ITopologyGraphBranchSupport";

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

  obtainTestExecutions(
    owner: string,
    repoName: string,
    branch?: string,
    commitSha?: string
  ): Promise<TestExecutionDataBranchSupport[]>;

  obtainTopologyGraph(
    owner: string,
    repoName: string
  ): Promise<TopologyGraphResponseBranchSupport>;
}
