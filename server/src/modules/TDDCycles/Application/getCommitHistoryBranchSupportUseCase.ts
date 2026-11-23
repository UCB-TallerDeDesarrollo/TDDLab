import { IGithubRepositoryBranchSupport } from "../Domain/IGithubRepositoryBranchSupport";
import { CommitHistoryDataBranchSupport } from "../Domain/ICommitHistoryDataBranchSupport";

export class GetCommitHistoryBranchSupportUseCase {
  constructor(private readonly repository: IGithubRepositoryBranchSupport) {}

  async execute(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitHistoryDataBranchSupport[]> {
    try {
      return await this.repository.getCommitHistoryData(owner, repoName, branch);
    } catch (error) {
      console.error(`Error executing GetCommitHistoryBranchSupportUseCase: ${error}`);
      throw error;
    }
  }
}
