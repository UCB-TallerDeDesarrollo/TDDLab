import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { ProcessedTDDLogs } from "../domain/ProcessedTDDLogInterfaces";

export class GetProcessedTDDLogs {
  constructor(private readonly repo: CommitHistoryRepository) {}

  async execute(owner: string, repoName: string): Promise<ProcessedTDDLogs> {
    // Llama al nuevo método del repositorio
    return await this.repo.obtainProcessedTDDLogs(owner, repoName);
  }
}