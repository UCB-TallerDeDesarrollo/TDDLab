export interface CommitCycleData {
  repository_slug: string;
  branch: string
  url: string;
  sha: string;
  tddCycle: string;
  coverage: number;
}
