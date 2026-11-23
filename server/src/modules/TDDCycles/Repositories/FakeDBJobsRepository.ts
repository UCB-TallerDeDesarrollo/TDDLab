import { Pool } from "pg";
import { IDBJobsRepository } from "../Domain/IDBJobsRepository";
import { ITimelineEntry } from "../Domain/ITimelineCommit";
import { JobDataObject } from "../Domain/JobDataObject";
import { TestResultDataObject } from "../Domain/TestResultDataObject";

/**
 * Adaptador temporal para desarrollar la vista de resultados de pruebas sin BD.
 * Los tres SHA representan: verde, rojo y una ejecución sin pruebas.
 */
export class FakeDBJobsRepository implements IDBJobsRepository {
  // La interfaz actual expone Pool. Este adaptador no abre conexiones.
  pool = {} as Pool;

  private readonly jobs: TestResultDataObject[] = [
    { id: 1001, sha: "commit-all-tests-passed", owner: "demo", reponame: "tests", conclusion: "success" },
    { id: 1002, sha: "commit-tests-failed", owner: "demo", reponame: "tests", conclusion: "failure" },
    { id: 1003, sha: "commit-without-tests", owner: "demo", reponame: "tests", conclusion: "skipped" },
  ];

  async getJobs(_owner: string, _repo: string): Promise<TestResultDataObject[]> { return this.jobs.map((job) => ({ ...job })); }
  async jobExists(_owner: string, _repo: string, jobId: number): Promise<boolean> { return this.jobs.some((job) => job.id === jobId); }
  async saveJob(_job: TestResultDataObject): Promise<void> {}
  async repositoryExists(_owner: string, _repoName: string): Promise<boolean> { return true; }
  async getJobsNotSaved(_owner: string, _repoName: string, _commitsWithActions: [string, number][]): Promise<[string, number][]> { return []; }
  async saveJobsList(_owner: string, _repoName: string, _jobs: Record<string, JobDataObject>): Promise<void> {}
  async saveLogs(_timeline: ITimelineEntry[]): Promise<void> {}
  async getCommitExecutions(_sha: string, _owner: string, _repo: string): Promise<never[]> { return []; }
  async findJobByCommit(sha: string, _owner: string, _repoName: string): Promise<TestResultDataObject | null> { return this.jobs.find((job) => job.sha === sha) ?? null; }
  async updateJobConclusion(sha: string, _owner: string, _repoName: string, conclusion: string): Promise<void> {
    const job = this.jobs.find((item) => item.sha === sha);
    if (job) job.conclusion = conclusion;
  }
  async saveJobFromTDDLog(_job: TestResultDataObject): Promise<void> {}
}
