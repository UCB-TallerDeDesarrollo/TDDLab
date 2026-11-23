import { IGithubRepositoryBranchSupport } from "../Domain/IGithubRepositoryBranchSupport";
import { TestExecutionDataBranchSupport } from "../Domain/ITestExecutionDataBranchSupport";

export class GetTestExecutionsBranchSupportUseCase {
  constructor(private readonly repository: IGithubRepositoryBranchSupport) {}

  async execute(
    owner: string,
    repoName: string,
    branch?: string,
    commitSha?: string
  ): Promise<TestExecutionDataBranchSupport[]> {
    try {
      return await this.repository.getTestExecutions(owner, repoName, branch, commitSha);
    } catch (error) {
      console.error(`Error executing GetTestExecutionsBranchSupportUseCase: ${error}`);
      throw error;
    }
  }
}
