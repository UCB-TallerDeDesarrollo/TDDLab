import { CommitDataObject } from "./githubCommitInterfaces";

export interface GithubAPIRepository {
  obtainCommitsOfRepo(
    owner: string,
    repoName: string,
  ): Promise<CommitDataObject[]>;

  obtainRunsOfGithubActions(owner: string, repoName: string): any;

  obtainJobsOfRepo(owner: string, repoName: string): any;

  obtainComplexityOfRepo(owner:string, repoName: string): any;
}

