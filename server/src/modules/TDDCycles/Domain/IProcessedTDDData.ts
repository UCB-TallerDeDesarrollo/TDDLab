export interface ProcessedTest { //informacion de cada test individual
  numPassedTests: number;
  failedTests: number;
  numTotalTests: number;
  timestamp: number;
  success: boolean;
  testId: number;
  passed: boolean;
  size: number;
}

export interface ProcessedCommitData { //numero de commits que contiene informacion de cada test
  commitNumber: number;
  commitId: string;
  commitName: string;
  testId:number;
  tests: ProcessedTest[];
}

export interface ProcessedTDDResponse {//resumen de ejecucion, tiene la interfaz de los commits
  commits: ProcessedCommitData[];
  summary: {
    totalCommits: number;
    totalExecutions: number;
  };
}