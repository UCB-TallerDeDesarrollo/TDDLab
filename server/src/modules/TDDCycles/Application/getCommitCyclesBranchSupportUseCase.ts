import { IGithubRepositoryBranchSupport } from "../Domain/IGithubRepositoryBranchSupport";
import { CommitCycleDataBranchSupport } from "../Domain/ICommitCycleDataBranchSupport";

export class GetCommitCyclesBranchSupportUseCase {
  constructor(private readonly repository: IGithubRepositoryBranchSupport) {}

  async execute(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitCycleDataBranchSupport[]> {
    try {
      return await this.repository.getCommitCyclesData(owner, repoName, branch);
    } catch (error) {
      console.error(`Error executing GetCommitCyclesBranchSupportUseCase: ${error}`);
      throw error;
    }
  }
}
