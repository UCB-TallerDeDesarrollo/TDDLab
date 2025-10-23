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
}

export type TDDLogEntry = TestExecutionLog | CommitLog;