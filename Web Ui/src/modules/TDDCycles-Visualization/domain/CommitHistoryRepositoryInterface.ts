import { CommitDataObject } from "./githubCommitInterfaces";
import { CommitCycle } from "./TddCycleInterface";
import { ProcessedTDDLogs } from "./ProcessedTDDLogInterfaces";

export interface CommitHistoryRepository {
  obtainCommitsOfRepo(owner: string, repoName: string): Promise<CommitDataObject[]>;
  obtainUserName(owner: string): Promise<string>;
  obtainCommitTddCycle(owner: string, repoName: string): Promise<CommitCycle[]>; 
  obtainProcessedTDDLogs(owner: string, repoName: string): Promise<ProcessedTDDLogs>;
}