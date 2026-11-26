export interface TDDExecutionEvent {
  eventId: string;
  branch?: string;
  numPassedTests: number;
  failedTests: number;
  numTotalTests: number;
  timestamp: number;
  success: boolean;
  coverage: number | null;
}

export interface TDDCommitEvent {
  sha: string;
  parents: string[];
  message: string;
  timestamp: number;
  branch?: string;
  executionIds: string[];
  stats: { additions: number; deletions: number; total: number };
  rewrite?: { id: string; from: string[] };
}

export interface TDDEventBatch {
  owner: string;
  repoName: string;
  executions: TDDExecutionEvent[];
  commits: TDDCommitEvent[];
}

export interface ITDDIngestionRepository {
  saveEvents(batch: TDDEventBatch): Promise<void>;
}

export class TDDEventConflictError extends Error {}
