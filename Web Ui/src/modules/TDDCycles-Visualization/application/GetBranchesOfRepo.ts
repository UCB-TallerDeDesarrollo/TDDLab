import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { BranchDTO } from "../domain/githubCommitInterfaces";

export class GetBranchesOfRepo {
  constructor(private readonly repo: CommitHistoryRepository) {}

  async execute(owner: string, repoName: string): Promise<BranchDTO[]> {
    return await this.repo.obtainBranches(owner, repoName);
  }
}
