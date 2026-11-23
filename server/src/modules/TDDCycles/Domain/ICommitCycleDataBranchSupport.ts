export interface CommitCycleDataBranchSupport {
  url: string;
  sha: string;
  tddCycle: string;
  coverage: number | null;
  branch: string;
  branches: string[];
}
