import { JobDataObject } from "../../Github/Domain/jobInterfaces";
import { GithubUseCases } from "../../Github/Application/githubUseCases";
import { JobDB } from "../Domain/Job";
import { JobRepository } from "../Repositories/TDDCycleRepository";

export class UpdateJobsTable {
  private adapter: JobRepository;
  private githubUseCases: GithubUseCases;

  constructor(adapter: JobRepository, githubAdapter: GithubUseCases  ) {
    this.adapter = adapter;
    this.githubUseCases = githubAdapter;
  }

  async checkForNewJobs(
    owner: string,
    repoName: string,
    listOfCommitsWithActions: [string, number][]
  ) {
    let jobsToAdd = [];

    for (const currentJob of listOfCommitsWithActions) {
      let row = await this.adapter.checkIfJobExistsInDb(
        owner,
        repoName,
        currentJob[1]
      );

      if (row.length != 0) break;
      else jobsToAdd.push(currentJob);
    }
    return jobsToAdd;
  }

  async saveJobsDB(
    owner: string,
    repoName: string,
    jobs: Record<string, JobDataObject>
  ) {
    let jobsFormatted: JobDB[] = [];
    for (const key in jobs) {
      jobsFormatted.push({
        id: jobs[key].jobs[0].run_id,
        sha: jobs[key].jobs[0].head_sha,
        owner: owner,
        reponame: repoName,
        conclusion: jobs[key].jobs[0].conclusion,
      });
    }
    this.adapter.insertRecordsIntoDatabase(jobsFormatted);
  }

  async getJobsAPI(owner: string, repoName: string) {
    let jobList: [string, number][] = await this.githubUseCases.obtainRunnedJobsList(owner, repoName); //[commitSha,workflowId][]
    console.log("JOB LIST: ", jobList);
    return jobList
  }
  async getJobsData(owner: string, repoName: string, jobList: [string, number][]){
    let jobs: Record<string, JobDataObject> = await this.githubUseCases.obtainJobsData(
      owner,
      repoName,
      jobList
    );
    return jobs;
  }
}
