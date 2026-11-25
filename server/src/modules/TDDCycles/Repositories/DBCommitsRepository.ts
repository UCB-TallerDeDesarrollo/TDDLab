import { Pool } from "pg";
import tddConfig from "../../../config/tddDb";
import { TDDCycleDataObject } from "../Domain/TDDCycleDataObject";
import { IDBCommitsRepository } from "../Domain/IDBCommitsRepository";
import { CommitDataObject } from "../Domain/CommitDataObject";

export class DBCommitsRepository implements IDBCommitsRepository {
  pool: Pool;
  constructor() {
    this.pool = new Pool(tddConfig);
  }

  async updateTestCount(
    repoOwner: string,
    repoName: string,
    commitSha: string,
    numTotalTests: number
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      const query = `
        UPDATE commitstable
        SET test_count = $1
        WHERE reponame = $2 AND owner = $3 AND sha = $4
      `;
      const values = [numTotalTests, repoName, repoOwner, commitSha];
      await client.query(query, values);
      console.log(`test_count actualizado a ${numTotalTests} para commit ${commitSha}`);
    } catch (error) {
      console.error(`Error al actualizar test_count en commitsTable:`, error);
      throw error;
    } finally {
      client.release();
    }
  }
  

  async getCommitBySha(owner: string, repoName: string, sha: string): Promise<any> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT * FROM commitstable
        WHERE owner = $1 AND repoName = $2 AND sha = $3
      `;
      const values = [owner, repoName, sha];
      const result = await client.query(query, values);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error al buscar el commit en commitsTable:", error);
      throw error;
    } finally {
      client.release();
    }
  }
  

  async saveCommit(
    owner: string,
    repoName: string,
    commit: TDDCycleDataObject
  ) {
    const client = await this.pool.connect();
    try {
      const query =
        "INSERT INTO commitsTable (owner, repoName, html_url, sha, total, additions, deletions, message,url, comment_count, commit_date, coverage, test_count, branch, author, stats_date, failed_tests, conclusion, hook_timestamp) VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)";
      const values = [
        owner,
        repoName,
        commit.html_url,
        commit.sha,
        commit.stats.total,
        commit.stats.additions,
        commit.stats.deletions,
        commit.commit.message,
        commit.commit.url,
        commit.commit.comment_count,
        commit.commit.date,
        commit.coverage,
        commit.test_count,
        commit.branch ?? null,
        commit.author ?? null,
        commit.stats_date ?? null,
        commit.failed_tests ?? null,
        commit.conclusion ?? null,
        commit.hook_timestamp ?? null,
      ];
      await client.query(query, values);
    } catch (error) {
      console.error(`Error saving commit`);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateCommitCoverage(
    owner: string,
    repoName: string,
    sha: string,
    coverage: string,
  ) {
    const client = await this.pool.connect();
    try {
      const query = `UPDATE commitstable SET coverage = $1 WHERE owner = $2 AND reponame = $3 AND sha = $4`;

      const values = [coverage, owner, repoName, sha];
      await client.query(query, values);
    } catch (error) {
      console.error(`Error updating coverage for commit.`);
      throw error;
    } finally {
      client.release();
    }
  }
  
  async updateTddCycle(
    sha: string,
    tdd_cicle:string,
  ) {
    const client = await this.pool.connect();
    try {
      const query =
        "UPDATE commitsTable SET tdd_cycle = $1 WHERE sha = $2";
      const values = [tdd_cicle, sha];
      await client.query(query, values);
    } catch (error) {
      console.error(`Error updating TDD cycle for commit.`);
      throw error;
    } finally {
      client.release();
    }
  }

  async getCommits(owner: string, repoName: string) {
    const client = await this.pool.connect();
    try {
      const query =
        "SELECT * FROM commitsTable WHERE owner = $1 AND reponame = $2 ORDER BY commit_date DESC";
      const values = [owner, repoName];
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error(`Error retrieving commits.`);
      throw error;
    } finally {
      client.release();
    }
  }
  async commitExists(owner: string, repoName: string, sha: string) {
    const client = await this.pool.connect();
    try {
      const query =
        "SELECT * FROM commitstable WHERE owner = $1 AND reponame = $2 AND sha=$3";
      const values = [owner, repoName, sha];
      const result = await client.query(query, values);
      return result.rows.length > 0;
    } catch (error) {
      console.error(`Error checking existence of commit.`);
      throw error;
    } finally {
      client.release();
    }
  }
  async repositoryExists(owner: string, repoName: string) {
    const client = await this.pool.connect();
    try {
      const query =
        "SELECT COUNT(*) FROM commitstable WHERE owner = $1 AND reponame = $2";
      const values = [owner, repoName];
      const result = await client.query(query, values);
      return result.rows[0].count > 0;
    } catch (error) {
      console.error(`Error checking existence of repository.`);
      throw error;
    } finally {
      client.release();
    }
  }
  async getCommitsNotSaved(
    owner: string,
    repoName: string,
    commitsData: CommitDataObject[]
  ) {
    let commitsToAdd = [];
    for (const currentCommit of commitsData) {
      let exists = await this.commitExists(owner, repoName, currentCommit.sha);
      if (exists) {
        break;
      } else {
        commitsToAdd.push(currentCommit);
      }
    }
    return commitsToAdd;
  }
  async saveCommitsList(
    owner: string,
    repoName: string,
    newCommits: TDDCycleDataObject[]
  ) {
    try {
      await Promise.all(
        newCommits.map((commit) => this.saveCommit(owner, repoName, commit))
      );
    } catch (error) {
      console.error(`Error saving commits list.`);
      throw error;
    }
  }
}
