import { IDatabaseConnection, IDatabaseConnectionFactory } from "../../Shared/Domain/IDatabaseConnectionFactory";
import { IDBJobsRepository } from "../Domain/IDBJobsRepository";
import { TestResultDataObject } from "../Domain/TestResultDataObject";
import { JobDataObject } from "../Domain/JobDataObject";
import { ITimelineEntry } from "../Domain/ITimelineCommit";

export class DBJobsRepositoryBuilder implements IDBJobsRepository {
  constructor(private connectionFactory: IDatabaseConnectionFactory) {}

  private async executeQuery(query: string, values?: any[]): Promise<any[]> {
    const connection: IDatabaseConnection = await this.connectionFactory.getConnection();
    try {
      const result = await connection.query(query, values);
      return result.rows;
    } finally {
      connection.release();
    }
  }

  async getJobs(owner: string, repo: string): Promise<any> {
    const rows = await this.executeQuery(
      "SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2",
      [owner, repo]
    );
    return rows;
  }

  async jobExists(owner: string, repo: string, jobId: number): Promise<any> {
    const rows = await this.executeQuery(
      "SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2 AND id = $3",
      [owner, repo, jobId]
    );
    return rows.length > 0;
  }

  async saveJob(job: TestResultDataObject): Promise<void> {
    await this.executeQuery(
      "INSERT INTO jobsTable (id, sha, owner, repoName, conclusion) VALUES ($1, $2, $3, $4, $5)",
      [job.id, job.sha, job.owner, job.reponame, job.conclusion]
    );
  }

  async repositoryExists(owner: string, repoName: string): Promise<boolean> {
    const rows = await this.executeQuery(
      "SELECT COUNT(*) FROM jobsTable WHERE owner = $1 AND reponame = $2",
      [owner, repoName]
    );
    return rows[0].count > 0;
  }

  async getJobsNotSaved(owner: string, repoName: string, commitsWithActions: [string, number][]): Promise<[string, number][]> {
    const jobsToAdd: [string, number][] = [];
    for (const currentJob of commitsWithActions) {
      const exists = await this.jobExists(owner, repoName, currentJob[1]);
      if (exists) {
        break;
      } else {
        jobsToAdd.push(currentJob);
      }
    }
    return jobsToAdd;
  }

  async saveJobsList(owner: string, repoName: string, jobs: Record<string, JobDataObject>): Promise<void> {
    const jobsFormatted: TestResultDataObject[] = Object.values(jobs).map((job) => ({
      id: job.jobs[0].run_id,
      sha: job.jobs[0].head_sha,
      owner: owner,
      reponame: repoName,
      conclusion: job.jobs[0].conclusion,
    }));
    await Promise.all(jobsFormatted.map((job) => this.saveJob(job)));
  }

  async saveLogs(timeline: ITimelineEntry[]): Promise<void> {
    const connection = await this.connectionFactory.getConnection();
    try {
      for (const entry of timeline) {
        const exists = await this.executionExists(connection, entry.commit_sha, entry.execution_timestamp);
        if (!exists) {
          await connection.query(
            `INSERT INTO commit_timeline (commit_sha, execution_timestamp, number_of_tests, passed_tests, color, repoOwner, repoName)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              entry.commit_sha,
              entry.execution_timestamp,
              entry.number_of_tests,
              entry.passed_tests,
              entry.color,
              entry.repoOwner,
              entry.repoName,
            ]
          );
        }
      }
    } finally {
      connection.release();
    }
  }

  async getCommitExecutions(sha: string, owner: string, repo: string): Promise<any[]> {
    const rows = await this.executeQuery(
      `SELECT * FROM commit_timeline WHERE commit_sha = $1 AND repoOwner = $2 AND repoName = $3`,
      [sha, owner, repo]
    );
    return rows;
  }

  async findJobByCommit(sha: string, owner: string, repoName: string): Promise<any | null> {
    const rows = await this.executeQuery(
      `SELECT * FROM jobstable WHERE sha = $1 AND owner = $2 AND reponame = $3`,
      [sha, owner, repoName]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async updateJobConclusion(sha: string, repoOwner: string, repoName: string, conclusion: string): Promise<void> {
    await this.executeQuery(
      `UPDATE jobstable SET conclusion = $4 WHERE sha = $1 AND owner = $2 AND reponame = $3 AND conclusion IS NULL`,
      [sha, repoOwner, repoName, conclusion]
    );
  }

  async saveJobFromTDDLog(job: TestResultDataObject): Promise<void> {
    await this.executeQuery(
      `INSERT INTO jobstable (sha, owner, reponame, conclusion) VALUES ($1, $2, $3, $4)`,
      [job.sha, job.owner, job.reponame, job.conclusion]
    );
  }

  private async executionExists(connection: IDatabaseConnection, commit_sha: string, timestamp: Date): Promise<boolean> {
    const result = await connection.query(
      `SELECT 1 FROM commit_timeline WHERE commit_sha = $1 AND execution_timestamp = $2 LIMIT 1`,
      [commit_sha, timestamp]
    );
    return result.rows.length > 0;
  }
}
