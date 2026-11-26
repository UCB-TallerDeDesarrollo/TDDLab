import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { MergeDTO } from "../domain/githubCommitInterfaces";

export class GetMergesOfRepo {
  constructor(private readonly repo: CommitHistoryRepository) {}

  async execute(owner: string, repoName: string): Promise<MergeDTO[]> {
    return await this.repo.obtainMerges(owner, repoName);
  }
}
