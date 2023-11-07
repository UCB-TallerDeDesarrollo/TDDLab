import { GithubUseCases } from "../../Github/Application/githubUseCases";
import { CommitRepository } from "../Repositories/commitRepository";
import { CommitTableUseCases } from "./CommitTableUseCases";

export class CommitUseCases {
  private commitTableUseCases: CommitTableUseCases;
  private repositoryAdapter: CommitRepository;
  private githubUseCases: GithubUseCases;

  constructor(
    repositoryAdapter: CommitRepository,
    githubUseCases: GithubUseCases
  ) {
    this.repositoryAdapter = repositoryAdapter;
    this.githubUseCases = githubUseCases;
    this.commitTableUseCases = new CommitTableUseCases(
      this.repositoryAdapter,
      this.githubUseCases
    );
  }

  async getCommits(owner: string, repoName: string) {
    let commits;
    try {
      if (!(await this.repositoryAdapter.repositoryExist(owner, repoName))) {
        const commits = await this.commitTableUseCases.getCommitsAPI(
          owner,
          repoName
        );
        const commitsFromSha =
          await this.commitTableUseCases.getCommitsFromShaAPI(
            owner,
            repoName,
            commits
          );
        await this.commitTableUseCases.saveCommitsDB(
          owner,
          repoName,
          commitsFromSha
        );
      } else {
        const commits = await this.commitTableUseCases.getCommitsAPI(
          owner,
          repoName
        ); //getCommitsAPI should be changed to getLastCommits once it is implemented
        const newCommits = await this.commitTableUseCases.checkNewCommits(
          owner,
          repoName,
          commits
        );
        const commitsFromSha =
          await this.commitTableUseCases.getCommitsFromShaAPI(
            owner,
            repoName,
            newCommits
          );
        await this.commitTableUseCases.saveCommitsDB(
          owner,
          repoName,
          commitsFromSha
        );
      }
      commits = await this.repositoryAdapter.getCommits(owner, repoName);
    } catch (error) {
      console.error("Error updating commits table:", error);
      throw error;
    }
    return commits;
  }
}
