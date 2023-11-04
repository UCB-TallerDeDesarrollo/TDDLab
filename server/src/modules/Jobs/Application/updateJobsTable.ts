// import { obtainJobsData } from "../../Github/Application/obtainJobs";
// import { obtainRunnedJobsList } from "../../Github/Application/obtainRunnedJobsList";
import { JobDataObject } from "../../Github/Domain/jobInterfaces";
import { GithubUseCases } from "../../Github/Application/githubUseCases";
import { JobDB } from "../Domain/Job";
import { JobRepository } from "../Repositories/jobRepository";

export class UpdateJobsTable {
  private adapter: JobRepository;
  private githubUseCases: GithubUseCases;

  constructor(adapter: JobRepository, githubAdapter: GithubUseCases  ) {
    this.adapter = adapter;
    this.githubUseCases = githubAdapter;
  }

  private async checkForNewJobs(
    owner: string,
    repoName: string,
    listOfCommitsWithActions: [string, number][]
  ) {
    let jobsToAdd = [];

    for (let index = 0; index < listOfCommitsWithActions.length; index++) {
      let currentJob = listOfCommitsWithActions[index];

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

  private async addJobsToDb(
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

  public async updateJobsTable(owner: string, repoName: string) {
    let listOfCommitsWithActions: [string, number][] =
      await this.githubUseCases.obtainRunnedJobsList(owner, repoName); //[commitSha,workflowId][]
    let jobsToAdd: [string, number][] = await this.checkForNewJobs(
      owner,
      repoName,
      listOfCommitsWithActions
    );
    if (jobsToAdd.length > 0) {
      console.log(jobsToAdd);
      let jobs: Record<string, JobDataObject> = await this.githubUseCases.obtainJobsData(
        owner,
        repoName,
        jobsToAdd
      );
      await this.addJobsToDb(owner, repoName, jobs);
    }
  }
}
