import { IDBCommitsRepository } from "../Domain/IDBCommitsRepository";
import { CommitDataObject } from "../Domain/commitInterfaces";
import { CommitDTO } from "../Domain/CommitDataObject";
import { IGithubRepository } from "../Domain/IGithubRepository";
export class GetTDDCyclesUseCase {
  private dbCommitRepository: IDBCommitsRepository;
  private githubRepository: IGithubRepository;

  constructor(
    dbCommitRepository: IDBCommitsRepository,
    githubRepository: IGithubRepository
  ) {
    this.dbCommitRepository = dbCommitRepository;
    this.githubRepository = githubRepository;
  }
  async execute(owner: string, repoName: string) {
    try {
      const commitsFromGithub = await this.githubRepository.getCommits(owner, repoName);
      let commitsToSave = commitsFromGithub;
      if ((await this.dbCommitRepository.repositoryExists(owner, repoName))) {
        commitsToSave = await this.dbCommitRepository.getCommitsNotSavedInDB(owner, repoName, commitsFromGithub);
      }
      const commitsInfoForTDDCycles = await this.getCommitsInforForTDDCycle(owner, repoName, commitsToSave);
      await this.saveCommitsToDB(owner, repoName, commitsInfoForTDDCycles);
      const commits = await this.dbCommitRepository.getCommits(owner, repoName);
      return commits;
    } catch (error) {
      console.error("Error executing TDDCycles Use case:", error);
      throw error;
    }
  }

  async getCommitsInforForTDDCycle(
    owner: string,
    repoName: string,
    commits: CommitDataObject[]
  ) {
    try {
      const commitsFromSha = await Promise.all(
        commits.map(commit => this.githubRepository.getCommitInfoForTDDCycle(owner, repoName, commit.sha))
      );

      const commitsData = commitsFromSha.map(({ html_url, stats, commit, sha, coveragePercentage }) => ({
        html_url,
        stats: {
          total: stats.total,
          additions: stats.additions,
          deletions: stats.deletions,
        },
        commit: {
          date: commit.author.date,
          message: commit.message,
          url: commit.url,
          comment_count: commit.comment_count,
        },
        sha,
        coverage: coveragePercentage,
      }));

      return commitsData;
    } catch (error) {
      console.error("Error getting commits from SHA:", error);
      throw new Error("Error getting commits from SHA");
    }
  }

  async saveCommitsToDB(
    owner: string,
    repoName: string,
    newCommits: CommitDTO[]
  ) {
    try {
        await Promise.all(
        newCommits.map(commit => this.dbCommitRepository.saveCommit(owner, repoName, commit))
        );
    } catch (error) {
      console.error("Error updating the commit table in the database:", error);
    }
  }
}
