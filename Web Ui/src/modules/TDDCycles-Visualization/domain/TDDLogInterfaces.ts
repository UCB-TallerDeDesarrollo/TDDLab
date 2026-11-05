// Representa una ejecución de pruebas en el log
export interface TestExecutionLog {
  numPassedTests: number;
  failedTests: number;
  numTotalTests: number;
  timestamp: number;
  success: boolean;
  testId: number;
}

export interface GitGraphCommit {
  sha: string;
  parents: string[];
  subject: string;
  timestamp?: number;
  body?: string;
  recordedBranches?: string[];
  historyBranch?: string;
}

// Representa un commit en el log
export interface CommitLog {
  commitId: string;
  commitName: string;
  commitTimestamp: number;
  gitGraph?: GitGraphCommit[];
  testId: number;
}

// Un tipo de unión para representar cualquier entrada en el archivo tdd_log.json
export type TDDLogEntry = TestExecutionLog | CommitLog;
