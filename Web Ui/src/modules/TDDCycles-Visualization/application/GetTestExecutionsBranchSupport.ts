import { CommitHistoryRepositoryBranchSupport } from "../domain/CommitHistoryRepositoryInterfaceBranchSupport";
import { TestExecutionDataBranchSupport } from "../domain/ITestExecutionDataBranchSupport";

export class GetTestExecutionsBranchSupport {
  constructor(private readonly repository: CommitHistoryRepositoryBranchSupport) {}

  async execute(
    owner: string,
    repoName: string,
    branch?: string,
    commitSha?: string
  ): Promise<TestExecutionDataBranchSupport[]> {
    return await this.repository.obtainTestExecutions(owner, repoName, branch, commitSha);
  }
}
