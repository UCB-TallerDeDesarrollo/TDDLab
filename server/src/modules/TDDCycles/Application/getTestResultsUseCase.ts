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
      const githubActionsRunsList = await this.getRunsOfGithubActionsIds(
        owner,
        repoName
      );

      let jobsToSave = githubActionsRunsList;

      if (await this.dbJobRepository.repositoryExists(owner, repoName)) {
        jobsToSave = await this.getJobsNotSavedInDB(
          owner,
          repoName,
          githubActionsRunsList
        );
      }

      const jobsFormatted = await this.getJobsDataFromGithub(
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
  async getJobsNotSavedInDB(
    owner: string,
    repoName: string,
    commitsWithActions: [string, number][]
  ) {
    let jobsToAdd = [];

    for (const currentJob of commitsWithActions) {
      let row = await this.dbJobRepository.checkIfJobExistsInDb(
        owner,
        repoName,
        currentJob[1]
      );
      if (row.length != 0) break;
      else jobsToAdd.push(currentJob);
    }
    return jobsToAdd;
  }

  async saveJobsToDB(
    owner: string,
    repoName: string,
    jobs: Record<string, JobDataObject>
  ) {
    let jobsFormatted: JobDB[] = Object.values(jobs).map((job) => ({
      id: job.jobs[0].run_id,
      sha: job.jobs[0].head_sha,
      owner: owner,
      reponame: repoName,
      conclusion: job.jobs[0].conclusion,
    }));

    await Promise.all(
      jobsFormatted.map((job) => this.dbJobRepository.saveJob(job))
    );
  }
  async getJobsDataFromGithub(
    owner: string,
    repoName: string,
    listOfCommitsWithActions: [string, number][]
  ) {
    const jobs: Record<string, JobDataObject> = {};
    await Promise.all(
      listOfCommitsWithActions.map(async (workflowInfo) => {
        const jobInfo = await this.githubRepository.obtainJobsOfACommit(
          owner,
          repoName,
          workflowInfo[1],
          1
        );
        jobs[workflowInfo[0]] = jobInfo;
      })
    );
    return jobs;
  }
  async getRunsOfGithubActionsIds(owner: string, repoName: string) {
    const githubruns = await this.githubRepository.obtainRunsOfGithubActions(
      owner,
      repoName
    );
    const commitsWithActions: [string, number][] =
      githubruns.data.workflow_runs.map((workFlowRun: any) => {
        return [workFlowRun.head_commit.id, workFlowRun.id];
      });
    return commitsWithActions;
  }
}