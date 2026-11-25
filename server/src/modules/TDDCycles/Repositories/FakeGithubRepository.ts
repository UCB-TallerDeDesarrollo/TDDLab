import { IGithubRepository } from "../Domain/IGithubRepository";
import { CommitDataObject, CommitInformationDataObject } from "../Domain/CommitDataObject";
import { CommitCycleData } from "../Domain/ICommitCycleData";
import { CommitHistoryData } from "../Domain/ICommitHistoryData";
import { JobDataObject } from "../Domain/JobDataObject";
import { TDDCycleDataObject } from "../Domain/TDDCycleDataObject";
import { BranchSnapshot, BranchSummary } from "../Domain/RepositoryRef";

/** Dependencia de GitHub sin red para que el caso de uso existente siga intacto. */
export class FakeGithubRepository implements IGithubRepository {
  async getCommits(): Promise<CommitDataObject[]> { return []; }
  async getCommitInfoForTDDCycle(): Promise<CommitInformationDataObject> { throw new Error("No disponible en el adaptador falso"); }
  async timeout(): Promise<void> {}
  async obtainRunsOfGithubActions(): Promise<{ data: { workflow_runs: never[] } }> { return { data: { workflow_runs: [] } }; }
  async obtainJobsOfACommit(): Promise<JobDataObject> { return { total_count: 0, jobs: [] }; }
  async getRunsOfGithubActionsIds(): Promise<[string, number][]> { return []; }
  async getJobsDataFromGithub(): Promise<Record<string, JobDataObject>> { return {}; }
  async getCommitsInforForTDDCycle(): Promise<TDDCycleDataObject[]> { return []; }
  async fetchCoverageDataForCommit(): Promise<object> { return {}; }
  async fetchCommitHistoryJson(): Promise<any[]> { return []; }
  async getCommitHistoryData(): Promise<CommitHistoryData[]> { return []; }
  async getCommitCyclesData(): Promise<CommitCycleData[]> { return []; }
  async getBranches(): Promise<BranchSummary[]> { return []; }
  async getBranchSnapshot(_owner: string, _repoName: string, branch: string): Promise<BranchSnapshot> {
    return {
      branch,
      ref: `refs/heads/${branch}`,
      resolvedSha: "fake-sha",
      files: {
        tddLog: { status: "ok", records: [] },
        commitHistory: { status: "ok", records: [] },
      },
    };
  }
}
