import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { TDDLogEntry } from "../domain/TDDLogInterfaces";

export class GetTDDLogsUseCase {
    constructor(private readonly commitHistoryRepository: CommitHistoryRepository) {}

    async execute(owner: string, repoName: string): Promise<TDDLogEntry[]> {
        return this.commitHistoryRepository.obtainTDDLogs(owner, repoName);
    }
}