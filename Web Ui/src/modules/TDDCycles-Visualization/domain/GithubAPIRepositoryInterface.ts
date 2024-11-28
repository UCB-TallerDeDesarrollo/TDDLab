import { CommitDataObject } from "./githubCommitInterfaces";
import { TddCycle} from "./TddcycleInterface";
export interface GithubAPIRepository {
  obtainCommitsOfRepo(
    owner: string,
    repoName: string,
  ): Promise<CommitDataObject[]>;

  obtainRunsOfGithubActions(owner: string, repoName: string): any;

  obtainJobsOfRepo(owner: string, repoName: string): any;

  obtainGetCommitsDb(owner: string, repoName: string): Promise<TddCycle[]>;
}
