import { IDatabaseConnection, IDatabaseConnectionFactory } from "../../Shared/Domain/IDatabaseConnectionFactory";
import { IDBCommitsRepository } from "../Domain/IDBCommitsRepository";
import { TDDCycleDataObject } from "../Domain/TDDCycleDataObject";
import { CommitDataObject } from "../Domain/CommitDataObject";

export class DBCommitsRepositoryBuilder implements IDBCommitsRepository {
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

  async saveCommit(owner: string, repoName: string, commit: TDDCycleDataObject): Promise<any> {
    const connection = await this.connectionFactory.getConnection();
    try {
      const query = `
        INSERT INTO commitsTable (owner, repoName, html_url, sha, total, additions, deletions, message, url, comment_count, commit_date, coverage, test_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;
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
      await connection.query(query, values);
    } finally {
      connection.release();
    }
  }

  async getCommits(owner: string, repoName: string): Promise<any> {
    const rows = await this.executeQuery(
      "SELECT * FROM commitsTable WHERE owner = $1 AND reponame = $2 ORDER BY commit_date DESC",
      [owner, repoName]
    );
    return rows;
  }

  async commitExists(owner: string, repoName: string, sha: string): Promise<any> {
    const rows = await this.executeQuery(
      "SELECT * FROM commitstable WHERE owner = $1 AND reponame = $2 AND sha = $3",
      [owner, repoName, sha]
    );
    return rows.length > 0;
  }

  async repositoryExists(owner: string, repoName: string): Promise<boolean> {
    const rows = await this.executeQuery(
      "SELECT COUNT(*) FROM commitstable WHERE owner = $1 AND reponame = $2",
      [owner, repoName]
    );
    return rows[0].count > 0;
  }

  async getCommitsNotSaved(owner: string, repoName: string, commitsData: CommitDataObject[]): Promise<CommitDataObject[]> {
    const commitsToAdd: CommitDataObject[] = [];
    for (const currentCommit of commitsData) {
      const exists = await this.commitExists(owner, repoName, currentCommit.sha);
      if (exists) {
        break;
      } else {
        commitsToAdd.push(currentCommit);
      }
    }
    return commitsToAdd;
  }

  async saveCommitsList(owner: string, repoName: string, newCommits: TDDCycleDataObject[]): Promise<void> {
    await Promise.all(
      newCommits.map((commit) => this.saveCommit(owner, repoName, commit))
    );
  }

  async updateCommitCoverage(owner: string, repoName: string, sha: string, coverage: string): Promise<any> {
    await this.executeQuery(
      "UPDATE commitstable SET coverage = $1 WHERE owner = $2 AND reponame = $3 AND sha = $4",
      [coverage, owner, repoName, sha]
    );
  }

  async updateTddCycle(sha: string, tdd_cicle: string): Promise<any> {
    await this.executeQuery(
      "UPDATE commitsTable SET tdd_cycle = $1 WHERE sha = $2",
      [tdd_cicle, sha]
    );
  }

  async getCommitBySha(owner: string, repoName: string, sha: string): Promise<any> {
    const rows = await this.executeQuery(
      "SELECT * FROM commitstable WHERE owner = $1 AND repoName = $2 AND sha = $3",
      [owner, repoName, sha]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async updateTestCount(repoOwner: string, repoName: string, commitSha: string, numTotalTests: number): Promise<void> {
    await this.executeQuery(
      `UPDATE commitstable SET test_count = $1 WHERE reponame = $2 AND owner = $3 AND sha = $4`,
      [numTotalTests, repoName, repoOwner, commitSha]
    );
  }
}
