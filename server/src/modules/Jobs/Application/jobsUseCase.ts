import { jobRepository } from "../Repositories/jobRepository";
import { UpdateJobsTable } from "./updateJobsTable";
import { GithubAdapter } from "../../Github/Repositories/github.API";

export class JobsUseCase {
  private updateJobsTable: UpdateJobsTable;
  private adapter: jobRepository;
  private githubAdapter: GithubAdapter;

  constructor(adapter: jobRepository, githubAdapter: GithubAdapter) {
    this.adapter = adapter;
    this.githubAdapter = githubAdapter;
    this.updateJobsTable = new UpdateJobsTable(this.adapter, this.githubAdapter);
  }

  public async getJobs(owner: string, repoName: string) {
    try {
      await this.updateJobsTable.updateJobsTable(owner, repoName);
    } catch (error) {
      console.error("Error updating jobs table:", error);
      return { error: "Error updating jobs table" };
    } finally {
      const Jobs = await this.adapter.getJobs(owner, repoName);
      return Jobs;
    }
  }
}