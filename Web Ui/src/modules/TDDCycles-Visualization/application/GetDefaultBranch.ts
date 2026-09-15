import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";

export class GetDefaultBranch {
  constructor(private readonly repo: CommitHistoryRepository) {}

  async execute(owner: string, repoName: string): Promise<string> {
    return await this.repo.obtainDefaultBranch(owner, repoName);
  }
}
