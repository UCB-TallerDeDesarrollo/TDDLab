import {
  CommitDataObject,
  CommitInformationDataObject,
} from "../Domain/commitInterfaces";
import { JobDataObject } from "../Domain/jobInterfaces";
import { GithubAdapter } from "../Repositories/github.API";

export class TDDCyclesPort {
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
      console.log(commits);
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
  async obtainJobsData(
    owner: string,
    repoName: string
  ): Promise<Record<string, JobDataObject>> {
    const githubruns = await this.adapter.obtainRunsOfGithubActions(
      owner,
      repoName
    );
    const commitsWithActions: [number, string][] =
      githubruns.data.workflow_runs.map((workFlowRun: any) => {
        return [workFlowRun.id, workFlowRun.head_commit.id];
      });
    const jobs: Record<string, JobDataObject> = {};
    await Promise.all(
      commitsWithActions.map(async (workflowInfo) => {
        const jobInfo = await this.adapter.obtainJobsOfACommit(
          owner,
          repoName,
          workflowInfo[0],
          1
        );
        jobs[workflowInfo[1]] = jobInfo;
      })
    );
    console.log(jobs);
    return jobs;
  }
}
