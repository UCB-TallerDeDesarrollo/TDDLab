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
  async saveCommit(owner: string, repoName: string, commit: TDDCycleDataObject) {
    const client = await this.pool.connect();
    try {
      const query =
        "INSERT INTO commitsTable (owner, repoName, html_url, sha, total,additions,deletions,message,url,comment_count,commit_date, coverage) VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10,$11, $12)";
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
      ];
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Error saving commit to the database:", error);
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
      console.error("Error getting commits from the database:", error);
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
      return result.rows;
    } catch (error) {
      console.error("Error checking if commit exists in the database:", error);
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
      console.error("Error checking if repository exists in the database:", error);
      throw error;
    } finally {
      client.release();
    }
  }
  async getCommitsNotSavedInDB(
    owner: string,
    repoName: string,
    commitsData: CommitDataObject[]
  ) {
    let commitsToAdd = [];
    for (const currentCommit of commitsData) {
      let row = await this.commitExists(
        owner,
        repoName,
        currentCommit.sha
      );
      if (row.length != 0) {
        break;
      } else {
        commitsToAdd.push(currentCommit);
      }
    }
    return commitsToAdd;
  }
}
