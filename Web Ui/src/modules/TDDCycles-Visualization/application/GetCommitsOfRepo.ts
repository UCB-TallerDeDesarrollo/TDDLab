import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { CommitDataObject } from "../domain/githubCommitInterfaces";

export class GetCommitsOfRepo {
  constructor(private readonly repo: CommitHistoryRepository) {}

  async execute(owner: string, repoName: string): Promise<CommitDataObject[]> {
    return await this.repo.obtainCommitsOfRepo(owner, repoName);
  }
}
