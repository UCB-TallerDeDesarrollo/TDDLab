interface ProcessedTest {
  passed: boolean;
  size: number;
}

interface ProcessedCommit {
  commitNumber: number;
  tests: ProcessedTest[];
}

export interface ProcessedTDDLogs {
  commits: ProcessedCommit[];
  summary: {
    totalCommits: number;
    totalExecutions: number;
  };
}