export interface CommitCycleBranchSupport {
  url: string;
  sha: string;
  tddCycle: string;
  coverage: number | null;
  branch: string;
  branches: string[];
}
