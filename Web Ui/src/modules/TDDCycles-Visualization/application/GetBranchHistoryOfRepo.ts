import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { BranchHistoryDTO } from "../domain/githubCommitInterfaces";

export class GetBranchHistoryOfRepo {
  constructor(private readonly repo: CommitHistoryRepository) {}

  async execute(
    owner: string,
    repoName: string,
    branch: string,
  ): Promise<BranchHistoryDTO | null> {
    return await this.repo.obtainBranchHistory(owner, repoName, branch);
  }
}
