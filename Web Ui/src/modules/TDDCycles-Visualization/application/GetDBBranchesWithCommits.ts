import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { IDBBranchWithCommits } from "../domain/IDBBranchWithCommits";

export class GetDBBranchesWithCommits {
  constructor(private repository: CommitHistoryRepository) {}

  async execute(owner: string, repoName: string): Promise<IDBBranchWithCommits[]> {
    return await this.repository.obtainBranchesWithCommits(owner, repoName);
  }
}
