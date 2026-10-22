import { CommitDataObject } from "./githubCommitInterfaces";
import { TDDLogEntry } from "./TDDLogInterfaces"; // add 

export interface CommitHistoryRepository {
  obtainCommitsOfRepo(owner: string, repoName: string): Promise<CommitDataObject[]>;
  obtainUserName(owner: string): Promise<string>;
  obtainTDDLogs(owner: string, repoName: string): Promise<TDDLogEntry[]>; // add
}
