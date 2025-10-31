export interface ProcessedTest {
  passed: boolean;
  size: number;
}

export interface ProcessedCommitData {
  commitNumber: number;
  tests: ProcessedTest[];
}

export interface ProcessedTDDResponse {
  commits: ProcessedCommitData[];
  summary: {
    totalCommits: number;
    totalExecutions: number;
  };
}