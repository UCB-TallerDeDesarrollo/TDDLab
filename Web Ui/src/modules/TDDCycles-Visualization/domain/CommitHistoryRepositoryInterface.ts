import { CommitHistoryDTO } from "./githubCommitInterfaces";
import { CommitCycleDTO } from "./TddCycleInterface";
import { TDDLogEntry } from "./TDDLogInterfaces";

export interface CommitHistoryRepository {
  obtainCommitsOfRepo(owner: string, repoName: string): Promise<CommitHistoryDTO[]>;
  obtainUserName(owner: string): Promise<string>;
  obtainCommitTddCycle(owner: string, repoName: string): Promise<CommitCycleDTO[]>;
  obtainTDDLogs(owner: string, repoName: string): Promise<TDDLogEntry[]>;
}
