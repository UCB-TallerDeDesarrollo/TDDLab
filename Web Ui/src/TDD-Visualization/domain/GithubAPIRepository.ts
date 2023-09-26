import { CommitDataObject } from "./models/githubCommitInterfaces";
//import { JobDataObject } from "../domain/models/jobInterfaces";

export interface GithubAPIRepository {
  obtainCommitsOfRepo(
    owner: string,
    repoName: string
  ): Promise<CommitDataObject[]>;

  obtainRunsOfGithubActions(owner: string, repoName: string): any;

  obtainJobsOfACommit(
    owner: string,
    repoName: string,
    jobId: number,
    attempt: number
  ): any;
}
