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
        this.commitTableUseCases.saveCommitsDB(owner, repoName, commits);
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
        this.commitTableUseCases.saveCommitsDB(owner, repoName, newCommits);
      }
    } catch (error) {
      console.error("Error updating commits table:", error);
      return { error: "Error updating commits table" };
    } finally {
      const jobs = await this.repositoryAdapter.getCommits(owner, repoName);
      return jobs;
    }
  }
}
