import { IGithubRepositoryBranchSupport } from "../Domain/IGithubRepositoryBranchSupport";

export class GetProjectBranchesBranchSupportUseCase {
  constructor(private readonly repository: IGithubRepositoryBranchSupport) {}

  async execute(owner: string, repoName: string): Promise<string[]> {
    try {
      return await this.repository.getProjectBranches(owner, repoName);
    } catch (error) {
      console.error(`Error executing GetProjectBranchesBranchSupportUseCase: ${error}`);
      throw error;
    }
  }
}
