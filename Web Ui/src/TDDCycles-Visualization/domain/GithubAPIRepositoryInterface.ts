import { CommitDataObject } from "./githubCommitInterfaces";
//import { JobDataObject } from "../domain/models/jobInterfaces";

export interface GithubAPIRepository {
  obtainCommitsOfRepo(
    owner: string,
    repoName: string
  ): Promise<CommitDataObject[]>;

  
  obtainRunsOfGithubActions(
    owner: string, 
    repoName: string): any;

  obtainJobsOfRepo(
    owner: string,
    repoName: string,
  ): any;
}