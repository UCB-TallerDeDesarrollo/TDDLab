import { IDBJobsRepository } from "../Domain/IDBJobsRepository";
import { IGithubRepository } from "../Domain/IGithubRepository";

export class GetTestResultsUseCase {
  private readonly dbJobRepository: IDBJobsRepository;
  private readonly githubRepository: IGithubRepository;

  constructor(
    dbJobRepository: IDBJobsRepository,
    githubRepository: IGithubRepository
  ) {
    this.dbJobRepository = dbJobRepository;
    this.githubRepository = githubRepository;
  }
  async execute(owner: string, repoName: string) {
    try {
      const githubActionsRunsList =
        await this.githubRepository.getRunsOfGithubActionsIds(owner, repoName);
      let jobsToSave = githubActionsRunsList;
      if (await this.dbJobRepository.repositoryExists(owner, repoName)) {
        jobsToSave = await this.dbJobRepository.getJobsNotSaved(
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
      await this.dbJobRepository.saveJobsList(owner, repoName, jobsFormatted);
      const jobs = await this.dbJobRepository.getJobs(owner, repoName);
      return jobs;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
}
