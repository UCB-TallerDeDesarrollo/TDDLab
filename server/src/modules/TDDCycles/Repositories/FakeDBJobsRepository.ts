import { Pool } from "pg";
import { IDBJobsRepository } from "../Domain/IDBJobsRepository";
import { ITimelineEntry } from "../Domain/ITimelineCommit";
import { JobDataObject } from "../Domain/JobDataObject";
import { TestResultDataObject } from "../Domain/TestResultDataObject";
import { ITestResultRegistrationRepository, RegistrationOutcome, TestResultRegistration } from "../Domain/ITestResultRegistrationRepository";

/**
 * Adaptador temporal para desarrollar la vista de resultados de pruebas sin BD.
 * Los tres SHA representan: verde, rojo y una ejecución sin pruebas.
 */
export class FakeDBJobsRepository implements IDBJobsRepository, ITestResultRegistrationRepository {
  // La interfaz actual expone Pool. Este adaptador no abre conexiones.
  pool = {} as Pool;

  private readonly jobs: TestResultDataObject[] = [
    { id: 1001, sha: "commit-all-tests-passed", owner: "demo", reponame: "tests", conclusion: "success" },
    { id: 1002, sha: "commit-tests-failed", owner: "demo", reponame: "tests", conclusion: "failure" },
    { id: 1003, sha: "commit-without-tests", owner: "demo", reponame: "tests", conclusion: "skipped" },
  ];

  private findByIdentity(sha: string, owner: string, repoName: string): TestResultDataObject | undefined {
    return this.jobs.find((job) => job.sha === sha && job.owner === owner && job.reponame === repoName);
  }

  async register(result: TestResultRegistration): Promise<RegistrationOutcome> {
    const existing = this.findByIdentity(result.sha, result.owner, result.reponame);
    if (existing) {
      if (existing.conclusion !== result.conclusion) return "conflict";
      if (result.branch) existing.branch = result.branch;
      return "duplicate";
    }

    const id = this.jobs.reduce((max, job) => Math.max(max, job.id ?? 0), 0) + 1;
    this.jobs.push({ ...result, id });
    return "created";
  }

  async getJobs(owner: string, repo: string): Promise<TestResultDataObject[]> {
    return this.jobs.filter(job => job.owner === owner && job.reponame === repo).map(job => ({ ...job }));
  }
  async jobExists(owner: string, repo: string, jobId: number): Promise<boolean> { return this.jobs.some(job => job.id === jobId && job.owner === owner && job.reponame === repo); }
  async saveJob(_job: TestResultDataObject): Promise<void> {}
  async repositoryExists(owner: string, repoName: string): Promise<boolean> { return this.jobs.some(job => job.owner === owner && job.reponame === repoName); }
  async getJobsNotSaved(_owner: string, _repoName: string, _commitsWithActions: [string, number][]): Promise<[string, number][]> { return []; }
  async saveJobsList(_owner: string, _repoName: string, _jobs: Record<string, JobDataObject>): Promise<void> {}
  async saveLogs(_timeline: ITimelineEntry[]): Promise<void> {}
  async getCommitExecutions(_sha: string, _owner: string, _repo: string): Promise<never[]> { return []; }
  async findJobByCommit(sha: string, owner: string, repoName: string): Promise<TestResultDataObject | null> {
    const job = this.findByIdentity(sha, owner, repoName);
    return job ? { ...job } : null;
  }
  async updateJobConclusion(sha: string, owner: string, repoName: string, conclusion: string): Promise<void> {
    const job = this.findByIdentity(sha, owner, repoName);
    if (job) job.conclusion = conclusion;
  }
  async saveJobFromTDDLog(_job: TestResultDataObject): Promise<void> {}
}
