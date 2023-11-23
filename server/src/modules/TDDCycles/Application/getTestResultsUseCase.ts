import { JobDataObject } from "../../Github/Domain/jobInterfaces";
import { JobDB } from "../Domain/JobDataObject";
import { JobRepository } from "../Repositories/DBJobsRepository";
import { GithubRepository } from "../Repositories/GithubRepository";

export class TestResultsUseCase {
  private jobRepository: JobRepository;
  private githubRepository: GithubRepository;

  constructor(
    jobRepository: JobRepository,
    githubRepository: GithubRepository
  ) {
    this.jobRepository = jobRepository;
    this.githubRepository = githubRepository;
  }
  async execute(owner: string, repoName: string) {
    let jobs;
    try {
      if (!(await this.jobRepository.repositoryExists(owner, repoName))) {
        const jobs = await this.getJobsFromGithub(owner, repoName);
        const jobsFormatted = await this.getJobsDataFromGithub(
          owner,
          repoName,
          jobs
        );
        this.saveJobsToDB(owner, repoName, jobsFormatted);
      } else {
        const jobs = await this.getJobsFromGithub(owner, repoName); //getJobsAPI should be changed to getLastJobs once it is implemented
        const newJobs = await this.getJobsNotSavedInDB(owner, repoName, jobs);
        const jobsFormatted = await this.getJobsDataFromGithub(
          owner,
          repoName,
          newJobs
        );
        this.saveJobsToDB(owner, repoName, jobsFormatted);
      }
      jobs = await this.jobRepository.getJobs(owner, repoName);
    } catch (error) {
      console.error("Error updating jobs table:", error);
      throw new Error("Error updating jobs table");
    }
    return jobs;
  }
  async getJobsNotSavedInDB(
    owner: string,
    repoName: string,
    commitsWithActions: [string, number][]
  ) {
    let jobsToAdd = [];

    for (const currentJob of commitsWithActions) {
      let row = await this.jobRepository.checkIfJobExistsInDb(
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
      jobsFormatted.map((job) => this.jobRepository.saveJob(job))
    );
  }

  async getJobsFromGithub(owner: string, repoName: string) {
    let jobList: [string, number][] = await this.obtainRunnedJobsList(
      owner,
      repoName
    ); //[commitSha,workflowId][]
    return jobList;
  }
  async getJobsDataFromGithub(
    owner: string,
    repoName: string,
    jobList: [string, number][]
  ) {
    let jobs: Record<string, JobDataObject> = await this.obtainJobsData(
      owner,
      repoName,
      jobList
    );
    return jobs;
  }
  async obtainJobsData(
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
  async obtainRunnedJobsList(owner: string, repoName: string) {
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
