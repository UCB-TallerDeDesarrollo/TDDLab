export interface CommitCycle {
  url: string;
  sha: string;
  tddCycle: string;
}
export interface CommitCycleDTO {
  repository_slug: string;
  branch: string;
  url: string;
  sha: string;
  tddCycle: string;
  coverage: number;
}
