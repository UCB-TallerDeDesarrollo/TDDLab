import { CommitDataObject } from "./githubCommitInterfaces";
import { CommitCycle } from "./TddCycleInterface";
import { TDDLogEntry } from "./TDDLogInterfaces"; // add 
import { IDBBranchWithCommits } from "./IDBBranchWithCommits";

export interface CommitHistoryRepository {
  obtainCommitsOfRepo(owner: string, repoName: string): Promise<CommitDataObject[]>;
  obtainUserName(owner: string): Promise<string>;
  obtainCommitTddCycle(owner: string, repoName: string): Promise<CommitCycle[]>; 
  obtainTDDLogs(owner: string, repoName: string): Promise<TDDLogEntry[]>; // add
  obtainBranchesWithCommits(owner: string, repoName: string): Promise<IDBBranchWithCommits[]>;
}