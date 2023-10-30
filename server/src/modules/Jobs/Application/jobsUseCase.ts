import { jobRepository } from "../Repositories/jobRepository";
import { updateJobsTable } from "./updateJobsTable";

export class JobsUseCase {
  private adapter: jobRepository;

  constructor(adapter: jobRepository = new jobRepository()) {
    this.adapter = adapter;
  }

  public async getJobs(owner: string, repoName: string) {
    try {
      await updateJobsTable(owner, repoName, this.adapter);
    } catch (error) {
      console.error("Error updating jobs table:", error);
      return { error: "Error updating jobs table" };
    } finally {
      const Jobs = await this.adapter.getJobs(owner, repoName);
      return Jobs;
    }
  }
}