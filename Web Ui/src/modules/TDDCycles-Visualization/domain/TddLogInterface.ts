export interface TDDLogEntry {
  numPassedTests?: number;
  failedTests?: number;
  numTotalTests?: number;
  timestamp?: number;
  success?: boolean;
  commitId?: string;
  commitName?: string;
  commitTimestamp?: number;
}

export interface TDDLogCycleData {
  phase: 'RED' | 'GREEN' | 'REFACTOR' | 'COMMIT';
  timestamp: number;
  numPassedTests: number;
  numTotalTests: number;
  success: boolean;
  commitInfo?: {
    id: string;
    name: string;
    timestamp: number;
  };
}

export interface TDDLog {
  getTDDLog(): Promise<TDDLogEntry[]>;
  getTDDCycleForCommit(commitId: string): Promise<TDDLogCycleData[]>;
}