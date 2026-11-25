import { CommitDataObject } from "./githubCommitInterfaces";
import { CommitCycle } from "./TddCycleInterface";
import { TDDLogEntry } from "./TDDLogInterfaces"; // add 
import { BranchSummary } from "./RepositoryRef";

export interface CommitHistoryRepository {
  obtainCommitsOfRepo(owner: string, repoName: string, branch?: string): Promise<CommitDataObject[]>;
  obtainUserName(owner: string): Promise<string>;
  obtainCommitTddCycle(owner: string, repoName: string, branch?: string): Promise<CommitCycle[]>;
  obtainTDDLogs(owner: string, repoName: string, branch?: string): Promise<TDDLogEntry[]>; // add
  obtainBranches?(owner: string, repoName: string): Promise<BranchSummary[]>;
}
