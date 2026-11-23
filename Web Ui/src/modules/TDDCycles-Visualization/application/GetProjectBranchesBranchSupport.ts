import { CommitHistoryRepositoryBranchSupport } from "../domain/CommitHistoryRepositoryInterfaceBranchSupport";

export class GetProjectBranchesBranchSupport {
  constructor(private readonly repository: CommitHistoryRepositoryBranchSupport) {}

  async execute(owner: string, repoName: string): Promise<string[]> {
    return await this.repository.obtainProjectBranches(owner, repoName);
  }
}
