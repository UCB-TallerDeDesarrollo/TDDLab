import { CommitHistoryDTO } from "./githubCommitInterfaces";
import { CommitCycleDTO } from "./TddCycleInterface";
import { TDDLogEntry } from "./TDDLogInterfaces";
import { BranchDTO, BranchHistoryDTO, MergeDTO } from "./githubCommitInterfaces";

export interface CommitHistoryRepository {
  obtainCommitsOfRepo(owner: string, repoName: string, branch?: string): Promise<CommitHistoryDTO[]>;
  obtainUserName(owner: string): Promise<string>;
  obtainCommitTddCycle(owner: string, repoName: string): Promise<CommitCycleDTO[]>;
  obtainTDDLogs(owner: string, repoName: string): Promise<TDDLogEntry[]>;
  obtainBranches(owner: string, repoName: string): Promise<BranchDTO[]>;
  obtainBranchHistory(owner: string, repoName: string, branch: string): Promise<BranchHistoryDTO | null>;
  obtainMerges(owner: string, repoName: string): Promise<MergeDTO[]>;
}
