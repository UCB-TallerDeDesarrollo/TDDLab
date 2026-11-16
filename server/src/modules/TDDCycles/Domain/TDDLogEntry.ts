export interface GitGraphCommit {
  sha: string;
  parents: string[];
  subject: string;
  timestamp?: number;
  body?: string;
  recordedBranches?: string[];
  historyBranch?: string;
}

export interface TestExecutionLog {
  numPassedTests: number;
  failedTests: number;
  numTotalTests: number;
  timestamp: number;
  success: boolean;
  testId: number;
}

export interface CommitLog {
  commitId: string;
  commitName: string;
  commitTimestamp: number;
  testId: number;
  gitGraph?: GitGraphCommit[];
}

export type TDDLogEntry = TestExecutionLog | CommitLog;
