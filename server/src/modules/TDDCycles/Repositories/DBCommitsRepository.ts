import { Pool } from "pg";
import config from "../../../config/db";
import { TDDCycleDataObject } from "../Domain/TDDCycleDataObject";
import { IDBCommitsRepository } from "../Domain/IDBCommitsRepository";
import { CommitDataObject } from "../Domain/CommitDataObject";

export class DBCommitsRepository implements IDBCommitsRepository {
  pool: Pool;
  constructor() {
    this.pool = new Pool(config);
  }
  async saveCommit(
    owner: string,
    repoName: string,
    commit: TDDCycleDataObject
  ) {
    const client = await this.pool.connect();
    try {
      const query =
        "INSERT INTO commitsTable (owner, repoName, html_url, sha, total, additions, deletions, message,url, comment_count, commit_date, coverage, test_count) VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10, $11, $12, $13)";
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
      ];
      await client.query(query, values);
    } catch (error) {
      console.error(`Error saving commit ${commit.sha} for ${owner}/${repoName}`);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateCommitCoverageAndTestCount(
    owner: string,
    repoName: string,
    sha: string,
    coverage: string,
    test_count: string
  ) {
    const client = await this.pool.connect();
    try {
      const query =
        "UPDATE commitsTable SET coverage = $1, test_count = $2 WHERE owner = $3 AND reponame = $4 AND sha = $5";
      const values = [coverage, test_count, owner, repoName, sha];
      await client.query(query, values);
    } catch (error) {
      console.error(`Error updating coverage and test count for commit ${sha} in ${owner} / ${repoName}`);
      throw error;
    } finally {
      client.release();
    }
  }
  
  async updateTddCicle(
    owner: string,
    repoName: string,
    sha: string,
    tdd_cicle:boolean,
  ) {
    const client = await this.pool.connect();
    try {
      const query =
        "UPDATE commitsTable SET tdd_cicle = $1 WHERE owner = $2 AND reponame = $3 AND sha = $4";
      const values = [tdd_cicle, owner, repoName, sha];
      await client.query(query, values);
    } catch (error) {
      console.error(`Error updating TDD cycle for commit ${sha} in ${owner}/${repoName}`);
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
      console.error(`Error retrieving commits for ${owner}/${repoName}`);
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
      console.error(`Error checking existence of commit ${sha} in ${owner}/${repoName}`);
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
      console.error(`Error checking existence of repository ${owner}/${repoName}`);
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
      console.error(`Error saving commits list for ${owner}/${repoName}`);
      throw error;
    }
  }
}
