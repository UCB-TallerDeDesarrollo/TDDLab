import { JobRepository } from "../Repositories/jobRepository";
import { UpdateJobsTable } from "./updateJobsTable";
import { GithubUseCases } from "../../Github/Application/githubUseCases";

export class JobsUseCase {
  private updateJobsTable: UpdateJobsTable;
  private adapter: JobRepository;
  private githubUseCases: GithubUseCases;

  constructor(adapter: JobRepository, githubAdapter: GithubUseCases) {
    this.adapter = adapter;
    this.githubUseCases = githubAdapter;
    this.updateJobsTable = new UpdateJobsTable(this.adapter, this.githubUseCases);
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