import { CommitHistoryRepositoryBranchSupport } from "../domain/CommitHistoryRepositoryInterfaceBranchSupport";
import { CommitDataObjectBranchSupport } from "../domain/githubCommitInterfacesBranchSupport";

export class GetCommitsOfRepoBranchSupport {
  constructor(private readonly repository: CommitHistoryRepositoryBranchSupport) {}

  async execute(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitDataObjectBranchSupport[]> {
    return await this.repository.obtainCommitsOfRepo(owner, repoName, branch);
  }
}
