import {
  CommitDataObject,
  CommitInformationDataObject,
} from "../Domain/commitInterfaces";
import { JobDataObject } from "../Domain/jobInterfaces";
import { GithubAdapter } from "../Repositories/github.API";

export class GithubUseCases {
  adapter: GithubAdapter;
  constructor() {
    this.adapter = new GithubAdapter();
  }

  async obtainCommitsOfRepo(
    owner: string,
    repoName: string
  ): Promise<CommitDataObject[]> {
    try {
      const commits = await this.adapter.obtainCommitsOfRepo(owner, repoName);
      return commits;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async obtainCommitsFromSha(
    owner: string,
    repoName: string,
    sha: string
  ): Promise<CommitInformationDataObject> {
    try {
      const commit = await this.adapter.obtainCommitsFromSha(
        owner,
        repoName,
        sha
      );
      return commit;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  //Already declared in separated files
  async obtainJobsData(
    owner: string,
    repoName: string,
    listOfCommitsWithActions: [string, number][]
  ) {
    const jobs: Record<string, JobDataObject> = {};
    await Promise.all(
      listOfCommitsWithActions.map(async (workflowInfo) => {
        const jobInfo = await this.adapter.obtainJobsOfACommit(
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
  async obtainRunnedJobsList(
    owner: string,
    repoName: string
  ) {
    const githubruns = await this.adapter.obtainRunsOfGithubActions(owner, repoName);
    const commitsWithActions: [string, number][] =
      githubruns.data.workflow_runs.map((workFlowRun: any) => {
        return [workFlowRun.head_commit.id, workFlowRun.id];
      });
    return commitsWithActions;
  }
}
