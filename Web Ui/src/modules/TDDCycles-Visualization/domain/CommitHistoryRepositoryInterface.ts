import { CommitDataObject } from "./githubCommitInterfaces";
import { CommitCycle } from "./TddCycleInterface";
import { TDDLogEntry } from "./TDDLogInterfaces"; // add 

export interface CommitHistoryRepository {
  obtainCommitsOfRepo(owner: string, repoName: string): Promise<CommitDataObject[]>;
  obtainUserName(owner: string): Promise<string>;
  obtainCommitTddCycle(owner: string, repoName: string): Promise<CommitCycle[]>; 
  obtainTDDLogs(owner: string, repoName: string): Promise<TDDLogEntry[]>; // add
}

// Independent of the legacy chart models, which cannot represent unknown data.
export interface BranchHistory {
  repository: { provider: "github"; owner: string; name: string };
  branch: string;
  commits: BranchHistoryCommit[];
  executions: BranchHistoryExecution[];
}

export interface BranchHistories {
  repository: { provider: "github"; owner: string; name: string };
  branches: BranchHistory[];
}

export interface BranchHistoryCommit {
  sha: string;
  parentShas: string[] | null;
  message: string;
  committedAt: Date | null;
  stats: { additions: number; deletions: number; total: number } | null;
  metrics: {
    executionEventId: string | null;
    numPassedTests: number | null;
    failedTests: number | null;
    numTotalTests: number | null;
    coveragePercentage: number | null;
    conclusion: "success" | "failure" | "neutral" | null;
  } | null;
}

export interface BranchHistoryExecution {
  eventId: string;
  branchAtCapture: string | null;
  headShaAtExecution: string | null;
  associatedCommitSha: string | null;
  timestamp: number;
  numPassedTests: number;
  failedTests: number;
  numTotalTests: number;
  coveragePercentage: number | null;
  success: boolean;
  testId: number | null;
}

// Separate port keeps existing consumers and their test doubles compatible.
export interface BranchHistoryRepository {
  obtainBranches(owner: string, repoName: string): Promise<string[]>;
  obtainBranchHistory(owner: string, repoName: string, branch: string): Promise<BranchHistory>;
}
