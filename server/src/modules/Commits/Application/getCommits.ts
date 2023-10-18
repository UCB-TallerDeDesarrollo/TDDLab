import { GithubAdapter } from "../../Github/Repositories/github.API";
import { CommitRepository } from "../Repositories/commitRepository";
import { getCommitsAPI, saveCommitsDB, checkNewCommits } from "./updateCommitsTable";

export class CommitUseCases {
  constructor(
    private repositoryAdapter: CommitRepository,
    private githubAdapter: GithubAdapter
  ) {
    this.repositoryAdapter = repositoryAdapter;
    this.githubAdapter = githubAdapter;
  }

  async getCommits(owner: string, repoName: string) {
    try {
      if (!await this.repositoryAdapter.repositoryExist(owner, repoName)) {
        const commits = await getCommitsAPI(owner, repoName, this.githubAdapter);
        saveCommitsDB(owner, repoName, commits, this.repositoryAdapter);
      } else {
        const commits = await getCommitsAPI(owner, repoName, this.githubAdapter); //getCommitsAPI should be changed to getLastCommits once it is implemented
        const newCommits = await checkNewCommits(owner, repoName, commits);
        saveCommitsDB(owner, repoName, newCommits, this.repositoryAdapter);
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