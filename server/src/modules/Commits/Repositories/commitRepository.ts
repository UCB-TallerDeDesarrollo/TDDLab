import { Pool } from "pg"; // Import the Pool from 'pg'
import config from "../../../config/db";
import {CommitDTO} from "../Domain/CommitDataObject";
import {ICommitRepository} from "../Domain/ICommitRepository";

export class CommitRepository implements ICommitRepository {
  pool: Pool;
  constructor() {
    this.pool = new Pool(config);
  }
  async saveCommitInfoOfRepo(
    owner: string,
    repoName: string,
    commit: CommitDTO
  ) {
    const client = await this.pool.connect();

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
      commit.testCount
    ];

    const result = await client.query(query, values);

    client.release();
    return result.rows;
  }
  async getCommits(owner: string, repoName: string) {
    const client = await this.pool.connect();

    const query =
      "SELECT * FROM commitsTable WHERE owner = $1 AND reponame = $2 ORDER BY commit_date DESC";
    const values = [owner, repoName];

    const result = await client.query(query, values);

    client.release();
    return result.rows;
  }
  async commitExists(owner: string, repoName: string, sha: string) {
    const client = await this.pool.connect();

    const query =
      "SELECT * FROM commitstable WHERE owner = $1 AND reponame = $2 AND sha=$3";
    const values = [owner, repoName, sha];

    const result = await client.query(query, values);
    client.release();
    return result.rows;
  }
  async repositoryExist(owner: string, repoName: string) {
    const client = await this.pool.connect();

    const query =
      "SELECT COUNT(*) FROM commitstable WHERE owner = $1 AND reponame = $2";
    const values = [owner, repoName];

    const result = await client.query(query, values);
    client.release();

    return result.rows[0].count > 0;
  }
}
