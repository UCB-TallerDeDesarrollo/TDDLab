import { CommitDataObject } from "./githubCommitInterfaces";
import { CommitCycle } from "./TddCycleInterface";
import { TDDLogEntry } from "./TDDLogInterfaces"; // add 
import { ProcessedTDDLogs } from "./ProcessedTDDLogInterfaces";

export interface CommitHistoryRepository {
  obtainCommitsOfRepo(owner: string, repoName: string): Promise<CommitDataObject[]>;
  obtainUserName(owner: string): Promise<string>;
  obtainCommitTddCycle(owner: string, repoName: string): Promise<CommitCycle[]>; 
  obtainTDDLogs(owner: string, repoName: string): Promise<TDDLogEntry[]>; // add
  obtainProcessedTDDLogs(owner: string, repoName: string): Promise<ProcessedTDDLogs>;
}