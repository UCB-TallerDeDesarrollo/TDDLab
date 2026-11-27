import { CommitDataObject } from "./githubCommitInterfaces";
import { CommitCycle } from "./TddCycleInterface";
import { TDDLogEntry } from "./TDDLogInterfaces"; // add 

export interface RepositoryBranch {
  name: string;
  headSha?: string;
  isDefault?: boolean;
  persisted?: boolean;
}

export interface CommitHistoryRepository {
  obtainVisualization?(owner: string, repoName: string, branch?: string): Promise<{
    commits: CommitDataObject[];
    commitsTddCycles: CommitCycle[];
    tddLogs: TDDLogEntry[];
  }>;
  obtainBranches(owner: string, repoName: string): Promise<RepositoryBranch[]>;
  obtainCommitsOfRepo(owner: string, repoName: string, branch?: string): Promise<CommitDataObject[]>;
  obtainUserName(owner: string): Promise<string>;
  obtainCommitTddCycle(owner: string, repoName: string, branch?: string): Promise<CommitCycle[]>;
  obtainTDDLogs(owner: string, repoName: string, branch?: string): Promise<TDDLogEntry[]>; // add
}
