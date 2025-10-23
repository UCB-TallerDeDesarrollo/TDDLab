import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { CommitCycle } from "../domain/TddCycleInterface";

export class GetCommitTddCycle {
  constructor(private readonly repo: CommitHistoryRepository) {}

  async execute(owner: string, repoName: string): Promise<CommitCycle[]> {
    return await this.repo.obtainCommitTddCycle(owner, repoName);
  }
}
