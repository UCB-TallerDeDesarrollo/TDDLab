import { Pool } from "pg";
import config from "../../../config/db";
import { TestResultDataObject } from "../Domain/TestResultDataObject";
import { IDBJobsRepository } from "../Domain/IDBJobsRepository";
import { JobDataObject } from "../Domain/JobDataObject";
import { ITimelineEntry } from "../Domain/ITimelineCommit";
import { ITestResultRegistrationRepository, RegistrationOutcome, TestResultRegistration } from "../Domain/ITestResultRegistrationRepository";

export class DBJobsRepository implements IDBJobsRepository, ITestResultRegistrationRepository {
  pool: Pool;
  constructor(pool: Pool = new Pool(config)) {
    this.pool = pool;
  }

  /**
   * Persists a registration atomically.  The unique index introduced by the
   * migration is the concurrency boundary: two requests cannot create the
   * same owner/repository/SHA tuple.
   */
  async register(result: TestResultRegistration): Promise<RegistrationOutcome> {
    const client = await this.pool.connect();
    try {
      const inserted = await client.query(
        `INSERT INTO jobstable (sha, owner, reponame, conclusion, branch)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (owner, reponame, sha) DO NOTHING
         RETURNING id`,
        [result.sha, result.owner, result.reponame, result.conclusion, result.branch ?? null]
      );
      if (inserted.rows.length > 0) return "created";

      const existing = await client.query(
        `SELECT conclusion, branch FROM jobstable
         WHERE sha = $1 AND owner = $2 AND reponame = $3`,
        [result.sha, result.owner, result.reponame]
      );
      if (existing.rows[0]?.conclusion === result.conclusion) {
        if (result.branch && existing.rows[0]?.branch !== result.branch) {
          await client.query(
            `UPDATE jobstable SET branch = $4
             WHERE sha = $1 AND owner = $2 AND reponame = $3`,
            [result.sha, result.owner, result.reponame, result.branch]
          );
        }
        return "duplicate";
      }
      return "conflict";
    } finally {
      client.release();
    }
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
        INSERT INTO jobstable (sha, owner, reponame, conclusion, branch)
        VALUES ($1, $2, $3, $4, $5)
      `;
      const values = [job.sha, job.owner, job.reponame, job.conclusion, job.branch ?? null];
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
            INSERT INTO commit_timeline (commit_sha, execution_timestamp, number_of_tests, passed_tests, color, repoOwner, repoName, branch, test_id, failed_tests, success)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `;
          const values = [
            entry.commit_sha,
            entry.execution_timestamp,
            entry.number_of_tests,
            entry.passed_tests,
            entry.color,
            entry.repoOwner,
            entry.repoName,
            entry.branch ?? null,
            entry.test_id ?? null,
            entry.failed_tests ?? null,
            entry.success ?? null
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
  async getJobs(owner: string, repo: string): Promise<TestResultDataObject[]> {
    let client;
    try {
      client = await this.pool.connect();
      const query = `SELECT id, sha, owner, reponame, conclusion, branch
        FROM jobstable
        WHERE owner = $1 AND reponame = $2
        ORDER BY id ASC`;
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
      const query = `SELECT 1 FROM test_execution execution
        JOIN repository ON repository.id = execution.repository_id
        WHERE repository.locator = $1 AND execution.id::text = $2`;
      const values = [`${owner}/${repo}`, String(jobId)];
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
      const query = "SELECT COUNT(*) FROM repository WHERE locator = $1";
      const values = [`${owner}/${repoName}`];
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
    // A read after a manual registration may have no GitHub workflow runs to
    // synchronize. Avoid opening a transaction (and creating empty metadata)
    // when there is nothing to persist.
    if (Object.keys(jobs).length === 0) return;

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const project = await client.query(
        "INSERT INTO project (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
        [owner]
      );
      const repository = await client.query(
        "INSERT INTO repository (project_id, provider, locator) VALUES ($1, 'github', $2) ON CONFLICT (project_id, provider, locator) DO UPDATE SET locator = EXCLUDED.locator RETURNING id",
        [project.rows[0].id, `${owner}/${repoName}`]
      );
      for (const job of Object.values(jobs)) {
        const run = job.jobs[0];
        if (!run) continue;
        const commit = await client.query(
          "INSERT INTO \"commit\" (repository_id, sha) VALUES ($1, $2) ON CONFLICT (repository_id, sha) DO UPDATE SET sha = EXCLUDED.sha RETURNING id",
          [repository.rows[0].id, run.head_sha]
        );
        const success = run.conclusion === "success";
        await client.query(
          "INSERT INTO test_execution (repository_id, observed_commit_id, started_at, passed_count, failed_count, total_count, success) VALUES ($1, $2, now(), $3, $4, $5, $6)",
          [repository.rows[0].id, commit.rows[0].id, success ? 1 : 0, success ? 0 : 1, 1, success]
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
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
