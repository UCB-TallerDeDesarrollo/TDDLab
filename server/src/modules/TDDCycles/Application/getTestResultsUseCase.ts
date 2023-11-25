import { JobDataObject } from "../Domain/jobInterfaces";
import { JobDB } from "../Domain/JobDataObject";
import { IDBJobsRepository } from "../Domain/IDBJobsRepository";
import { IGithubRepository } from "../Domain/IGithubRepository";

export class GetTestResultsUseCase {
  private dbJobRepository: IDBJobsRepository;
  private githubRepository: IGithubRepository;

  constructor(
    jobRepository: IDBJobsRepository,
    githubRepository: IGithubRepository
  ) {
    this.dbJobRepository = jobRepository;
    this.githubRepository = githubRepository;
  }
  async execute(owner: string, repoName: string) {
    try {
      const githubActionsRunsList = await this.githubRepository.getRunsOfGithubActionsIds(
        owner,
        repoName
      );
      let jobsToSave = githubActionsRunsList;
      if (await this.dbJobRepository.repositoryExists(owner, repoName)) {
        jobsToSave = await this.dbJobRepository.getJobsNotSavedInDB(
          owner,
          repoName,
          githubActionsRunsList
        );
      }
      const jobsFormatted = await this.githubRepository.getJobsDataFromGithub(
        owner,
        repoName,
        jobsToSave
      );
      await this.saveJobsToDB(owner, repoName, jobsFormatted);
      const jobs = await this.dbJobRepository.getJobs(owner, repoName);
      return jobs;
    } catch (error) {
      console.error("Error executing Test Results Use case:", error);
      throw error;
    }
  }
}
