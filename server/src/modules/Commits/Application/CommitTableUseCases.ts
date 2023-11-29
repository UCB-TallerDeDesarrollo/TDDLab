import { GithubUseCases } from "../../Github/Application/githubUseCases";
import { CommitDataObject } from "../../Github/Domain/commitInterfaces";
import { CommitDTO } from "../Domain/CommitDataObject";
import { CommitRepository } from "../Repositories/commitRepository";

export class CommitTableUseCases {
  constructor(
    private repositoryAdapter: CommitRepository,
    private githubUseCases: GithubUseCases
  ) {
    this.repositoryAdapter = repositoryAdapter;
    this.githubUseCases = githubUseCases;
  }

  async checkNewCommits(
    owner: string,
    repoName: string,
    commitsData: CommitDataObject[]
  ) {
    let commitsToAdd = [];
    for (const currentCommit of commitsData) {
      let row = await this.repositoryAdapter.commitExists(
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

  async getCommitsAPI(owner: string, repoName: string) {
    try {
      const commits = await this.githubUseCases.obtainCommitsOfRepo(
        owner,
        repoName
      );
      return commits;
    } catch (error) {
      console.error("Error en la obtención de commits:", error);
      throw new Error("Error en la obtención de commits");
    }
  }
  async getCommitsFromShaAPI(
    owner: string,
    repoName: string,
    commits: CommitDataObject[]
  ) {
    try {
      const commitsFromSha = await Promise.all(
        commits.map((commit: any) => {
          return this.githubUseCases.obtainCommitsFromSha(
            owner,
            repoName,
            commit.sha
          );
        })
      );
      const commitsData: CommitDTO[] = commitsFromSha.map((commit: any) => {
        return {
          html_url: commit.html_url,
          stats: {
            total: commit.stats.total,
            additions: commit.stats.additions,
            deletions: commit.stats.deletions,
          },
          commit: {
            date: commit.commit.author.date,
            message: commit.commit.message,
            url: commit.commit.url,
            comment_count: commit.commit.comment_count,
          },
          sha: commit.sha,
          coverage: commit.coveragePercentage,
          test_count: commit.test_count
        };
      });
      return commitsData;
    } catch (error) {
      console.error("Error getting commits from SHA:", error);
      throw new Error("Error getting commits from SHA");
    }
  }

  async saveCommitsDB(
    owner: string,
    repoName: string,
    newCommits: CommitDTO[]
  ) {
    try {
      if (newCommits.length > 0) {
        await Promise.all(
          newCommits.map(async (commit: CommitDTO) => {
            await this.repositoryAdapter.saveCommitInfoOfRepo(
              owner,
              repoName,
              commit
            );
          })
        );
      }
    } catch (error) {
      console.error("Error updating the commit table in the database:", error);
    }
  }
}
