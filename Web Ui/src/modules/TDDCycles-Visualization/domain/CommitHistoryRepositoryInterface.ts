import { ComplexityObject } from "./ComplexityInterface";
import { CommitDataObject } from "./githubCommitInterfaces";
import { CommitCycle } from "./TddCycleInterface";
import { TDDLogEntry } from "./TDDLogInterfaces"; // add 

export interface CommitHistoryRepository {
  obtainCommitsOfRepo(owner: string, repoName: string): Promise<CommitDataObject[]>;
  obtainUserName(owner: string): Promise<string>;
  obtainComplexityOfRepo(owner: string, repoName: string): Promise<ComplexityObject[]>;
  obtainCommitTddCycle(owner: string, repoName: string): Promise<CommitCycle[]>; 
  obtainTDDLogs(owner: string, repoName: string): Promise<TDDLogEntry[]>; // add
}