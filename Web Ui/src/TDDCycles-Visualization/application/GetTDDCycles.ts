import { GithubAPIRepository } from "../domain/GithubAPIRepository";
import { CommitDataObject, CommitInformationDataObject } from "../domain/githubCommitInterfaces";
import { JobDataObject } from "../domain/jobInterfaces";

export class GetTDDCycles {
  adapter: GithubAPIRepository;
  constructor(githubAPIRepository: GithubAPIRepository) {
    this.adapter = githubAPIRepository;
  }

  async obtainCommitsOfRepo(
    owner: string,
    repoName: string
  ): Promise<CommitDataObject[]> {
    return await this.adapter.obtainCommitsOfRepo(owner, repoName);
  }

  async obtainCommitInformation(
    owner: string, 
    repoName: string, 
    sha: string
    ): Promise<CommitInformationDataObject> {
    return await this.adapter.obtainCommitsFromSha(owner, repoName, sha);
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
    commitsWithActions.map(async (workflowInfo) => {
      const jobInfo = await this.adapter.obtainJobsOfACommit(
        owner,
        repoName,
        workflowInfo[0],
        1
      );
      jobs[workflowInfo[1]] = jobInfo;
    });

    return jobs;
  }
}