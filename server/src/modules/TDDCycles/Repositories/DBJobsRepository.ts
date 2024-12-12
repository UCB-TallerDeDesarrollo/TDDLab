import { Pool } from "pg";
import config from "../../../config/db";
import { TestResultDataObject } from "../Domain/TestResultDataObject";
import { IDBJobsRepository } from "../Domain/IDBJobsRepository";
import { JobDataObject } from "../Domain/JobDataObject";
import { ITimelineEntry } from "../Domain/ITimelineCommit";

export class DBJobsRepository implements IDBJobsRepository {
  pool: Pool;
  constructor() {
    this.pool = new Pool(config);
  }

  async findJobByCommit(sha: string, owner: string, repoName: string): Promise<any | null> {
    const client = await this.pool.connect();
    try {
        const query = `
            SELECT * 
            FROM jobstable
            WHERE sha = $1 AND owner = $2 AND reponame = $3
        `;
        const values = [sha, owner, repoName];
        const result = await client.query(query, values);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error buscando el commit en jobsTable:", error); //esto es complicado, no creo que pase (dios)
        throw error;
    } finally {
        client.release();
    }
}

async updateJobConclusion(sha: string, repoOwner: string, repoName: string, conclusion: string): Promise<void> {
  const client = await this.pool.connect();
  try {
    const query = `
      UPDATE jobstable
      SET conclusion = $4
      WHERE sha = $1 AND owner = $2 AND reponame = $3 AND conclusion IS NULL
    `;
    const values = [sha, repoOwner, repoName, conclusion];
    await client.query(query, values);
  } catch (error) {
    console.error("Error al actualizar la conclusión en jobsTable:", error);
    throw error;
  } finally {
    client.release();
  }
}

  async saveJobFromTDDLog(job: TestResultDataObject): Promise<void> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO jobstable (sha, owner, reponame, conclusion)
        VALUES ($1, $2, $3, $4)
      `;
      const values = [job.sha, job.owner, job.reponame, job.conclusion];
      await client.query(query, values);
    } catch (error) {
      console.error("Error al insertar en jobsTable:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getCommitExecutions(sha: string, owner: string, repo: string): Promise<any[]> {
    let client;
    try {
      client = await this.pool.connect();
      const query = `
        SELECT * 
        FROM commit_timeline
        WHERE commit_sha = $1 
          AND repoOwner = $2
          AND repoName = $3
      `;
      const values = [sha, owner, repo];
      const result = await client.query(query, values);
  
      console.log("This is the result ", result.rows);
  
      return result.rows;
  
    } catch (error) {
      console.error("Error fetching commit executions:", error);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async saveLogs(timeline: ITimelineEntry[]) {
    const client = await this.pool.connect();
    try {
      for (const entry of timeline) {
        const exists = await this.executionExists(entry.commit_sha, entry.execution_timestamp);
        if (!exists) {
          const query = `
            INSERT INTO commit_timeline (commit_sha, execution_timestamp, number_of_tests, passed_tests, color, repoOwner, repoName)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `;
          const values = [
            entry.commit_sha,
            entry.execution_timestamp,
            entry.number_of_tests,
            entry.passed_tests,
            entry.color,
            entry.repoOwner,
            entry.repoName
          ];
          await client.query(query, values);
        }
      }
    } catch (error) {
      console.error("Error al guardar el log:", error);
      throw error;
    } finally {
      client.release();
    }
  }


  async saveJob(job: TestResultDataObject) {
    const client = await this.pool.connect();
    try {
      const { id, sha, owner, reponame, conclusion } = job;
      const query =
        "INSERT INTO jobsTable (id, sha, owner, repoName, conclusion) VALUES ($1, $2, $3, $4, $5)";
      const values = [id, sha, owner, reponame, conclusion];
      await client.query(query, values);
    } catch (error) {
      throw new Error("Error inserting job");
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  async getJobs(owner: string, repo: string) {
    let client;
    try {
      client = await this.pool.connect();
      const query =
        "SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2";
      const values = [owner, repo];
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error("Error en la consulta a la base de datos");
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  async jobExists(owner: string, repo: string, jobId: number) {
    let client;
    try {
      client = await this.pool.connect();
      const query =
        "SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2 AND id=$3";
      const values = [owner, repo, jobId];
      const result = await client.query(query, values);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error("Error en la consulta a la base de datos");
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  async repositoryExists(owner: string, repoName: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const query =
        "SELECT COUNT(*) FROM jobsTable WHERE owner = $1 AND reponame = $2";
      const values = [owner, repoName];
      const result = await client.query(query, values);
      return result.rows[0].count > 0;
    } catch (error) {
      throw new Error(`Error checking repository existence: ${error}`);
    } finally {
      client.release();
    }
  }
  async getJobsNotSaved(
    owner: string,
    repoName: string,
    commitsWithActions: [string, number][]
  ) {
    let jobsToAdd = [];

    for (const currentJob of commitsWithActions) {
      let exists = await this.jobExists(owner, repoName, currentJob[1]);
      if (exists) break;
      else jobsToAdd.push(currentJob);
    }
    return jobsToAdd;
  }
  async saveJobsList(
    owner: string,
    repoName: string,
    jobs: Record<string, JobDataObject>
  ) {
    let jobsFormatted: TestResultDataObject[] = Object.values(jobs).map(
      (job) => ({
        id: job.jobs[0].run_id,
        sha: job.jobs[0].head_sha,
        owner: owner,
        reponame: repoName,
        conclusion: job.jobs[0].conclusion,
      })
    );

    await Promise.all(jobsFormatted.map((job) => this.saveJob(job)));
  }

  async executionExists(commit_sha: string, timestamp: Date): Promise<boolean> {
    const client = await this.pool.connect();
    try {
        const query = `
            SELECT 1 FROM commit_timeline
            WHERE commit_sha = $1 AND execution_timestamp = $2
            LIMIT 1
        `;
        const values = [commit_sha, timestamp];
        const result = await client.query(query, values);
        return result.rows.length > 0;
    } catch (error) {
      console.error("An error occurred:", error); 
      throw error; 
    } finally {
        client.release();
    }
  }

}
