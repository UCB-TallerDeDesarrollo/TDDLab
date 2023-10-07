import { CommitDataObject, CommitInformationDataObject } from "./githubCommitInterfaces";
//import { JobDataObject } from "../domain/models/jobInterfaces";

export interface GithubAPIRepository {
  obtainCommitsOfRepo(
    owner: string,
    repoName: string
  ): Promise<CommitDataObject[]>;

  obtainCommitsFromSha(
    owner: string,
    repoName: string,
    sha: string
  ): Promise<CommitInformationDataObject>;

  obtainRunsOfGithubActions(owner: string, repoName: string): any;

  obtainJobsOfACommit(
    owner: string,
    repoName: string,
    jobId: number,
    attempt: number
  ): any;
}