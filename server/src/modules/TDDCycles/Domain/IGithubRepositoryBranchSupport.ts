import { CommitHistoryDataBranchSupport } from "./ICommitHistoryDataBranchSupport";
import { CommitCycleDataBranchSupport } from "./ICommitCycleDataBranchSupport";
import { TestExecutionDataBranchSupport } from "./ITestExecutionDataBranchSupport";
import { TopologyGraphResponseBranchSupport } from "./ITopologyGraphBranchSupport";

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

  getTestExecutions(
    owner: string,
    repoName: string,
    branch?: string,
    commitSha?: string
  ): Promise<TestExecutionDataBranchSupport[]>;

  getTopologyGraph(
    owner: string,
    repoName: string
  ): Promise<TopologyGraphResponseBranchSupport>;
}
