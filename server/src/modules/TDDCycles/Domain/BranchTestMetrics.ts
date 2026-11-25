export interface BranchTestMetricCommit {
  sha: string;
  message: string;
  committedAt: string | null;
  numTotalTests: number | null;
  coveragePercentage: number | null;
  conclusion: string | null;
}

export interface BranchTestMetricHistory {
  branch: string;
  commits: BranchTestMetricCommit[];
}
