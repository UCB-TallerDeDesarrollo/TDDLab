import { CommitDataObject } from "./githubCommitInterfaces";
import { CommitCycle } from "./TddCycleInterface";
import { TDDLogEntry } from "./TDDLogInterfaces";

export interface CommitHistoryRepository {
  obtainCommitsOfRepo(owner: string, repoName: string): Promise<CommitDataObject[]>;
  obtainUserName(owner: string): Promise<string>;
  obtainDefaultBranch(owner: string, repoName: string): Promise<string>;
  obtainCommitTddCycle(owner: string, repoName: string): Promise<CommitCycle[]>;
  obtainTDDLogs(owner: string, repoName: string, branch: string): Promise<TDDLogEntry[]>;
}