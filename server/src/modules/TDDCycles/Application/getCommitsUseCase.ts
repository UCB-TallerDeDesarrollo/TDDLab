import { DBCommitRepository } from "../Repositories/DBCommitsRepository";
import { CommitDataObject } from "../../Github/Domain/commitInterfaces";
import { CommitDTO } from "../Domain/CommitDataObject";
import { GithubRepository } from "../Repositories/GithubRepository";
export class CommitsUseCase {
  private dbCommitRepository: DBCommitRepository;
  private githubRepository: GithubRepository;

  constructor(
    dbCommitRepository: DBCommitRepository,
    githubRepository: GithubRepository
  ) {
    this.dbCommitRepository = dbCommitRepository;
    this.githubRepository = githubRepository;
  }
  async execute(owner: string, repoName: string) {
    let commits;
    try {
      if (!(await this.dbCommitRepository.repositoryExists(owner, repoName))) {
        const commits = await this.githubRepository.getCommits(owner, repoName);
        const commitsInfoForTDDCycles = await this.getCommitsInforForTDDCycle(
          owner,
          repoName,
          commits
        );
        await this.saveCommitsToDB(owner, repoName, commitsInfoForTDDCycles);
      } else {
        const commits = await this.githubRepository.getCommits(owner, repoName); //getCommitsAPI should be changed to getLastCommits once it is implemented
        const newCommits = await this.getCommitsNotSavedInDB(
          owner,
          repoName,
          commits
        );
        const commitsInfoForTDDCycle = await this.getCommitsInforForTDDCycle(
          owner,
          repoName,
          newCommits
        );
        await this.saveCommitsToDB(owner, repoName, commitsInfoForTDDCycle);
      }
      commits = await this.dbCommitRepository.getCommits(owner, repoName);
    } catch (error) {
      console.error("Error updating commits table:", error);
      throw error;
    }
    return commits;
  }
  async getCommitsNotSavedInDB(
    owner: string,
    repoName: string,
    commitsData: CommitDataObject[]
  ) {
    let commitsToAdd = [];
    for (const currentCommit of commitsData) {
      let row = await this.dbCommitRepository.commitExists(
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
      if (newCommits.length > 0) {
        await Promise.all(
          newCommits.map(async (commit: CommitDTO) => {
            await this.dbCommitRepository.saveCommit(owner, repoName, commit);
          })
        );
      }
    } catch (error) {
      console.error("Error updating the commit table in the database:", error);
    }
  }
}
