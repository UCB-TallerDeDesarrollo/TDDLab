import { GithubAdapter } from "../../Github/Repositories/github.API";
import { CommitRepository } from "../Repositories/commitRepository";
import { CommitTableUseCases } from "./CommitTableUseCases";

export class CommitUseCases {
  private commitTableUseCases: CommitTableUseCases;
  constructor(
    private repositoryAdapter: CommitRepository,
    private githubAdapter: GithubAdapter
  ) {
    this.repositoryAdapter = repositoryAdapter;
    this.githubAdapter = githubAdapter;
    this.commitTableUseCases = new CommitTableUseCases(
      this.repositoryAdapter,
      this.githubAdapter
    );
  }

  async getCommits(owner: string, repoName: string) {
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
      const jobs = await this.repositoryAdapter.getCommits(owner, repoName);
      return jobs;
    } catch (error) {
      console.error("Error updating commits table:", error);
      return { error: "Error updating commits table" };
    }
  }
}
