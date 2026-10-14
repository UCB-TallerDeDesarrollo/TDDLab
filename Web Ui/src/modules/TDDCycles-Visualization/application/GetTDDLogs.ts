import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { TDDLogEntry } from "../domain/TDDLogInterfaces";

export class GetTDDLogs {
  constructor(private readonly repo: CommitHistoryRepository) {}

  async execute(owner: string, repoName: string, branch: string): Promise<TDDLogEntry[]> {
    return await this.repo.obtainTDDLogs(owner, repoName, branch);
  }
}
