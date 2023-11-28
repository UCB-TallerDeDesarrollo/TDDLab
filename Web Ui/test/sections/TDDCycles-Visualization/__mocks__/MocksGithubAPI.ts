import { GithubAPIRepository } from "../../../../src/modules/TDDCycles-Visualization/domain/GithubAPIRepositoryInterface";
import { CommitDataObject } from "../../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../../src/modules/TDDCycles-Visualization/domain/jobInterfaces";
import { mockArrayCommitData } from "./dataTypeMocks/commitData";
import { mockArrayJobData } from "./dataTypeMocks/jobData";

export class MockGithubAPI implements GithubAPIRepository {
  async obtainCommitsOfRepo(): Promise<CommitDataObject[]> {
    let commits = mockArrayCommitData;
    return commits;
  }
  obtainRunsOfGithubActions(): any {
    return {};
  }

  async obtainJobsOfRepo(): Promise<JobDataObject[]> {
    let jobs: JobDataObject[] = mockArrayJobData;

    return jobs;
  }
}

export class MockGithubAPIEmpty implements GithubAPIRepository {
  async obtainCommitsOfRepo(): Promise<CommitDataObject[]> {
    let commits: CommitDataObject[] = [];
    return commits;
  }
  obtainRunsOfGithubActions(): any {
    return {};
  }

  async obtainJobsOfRepo(): Promise<JobDataObject[]> {
    let jobs: JobDataObject[] = [];

    return jobs;
  }
}

export class MockGithubAPIError implements GithubAPIRepository {
  async obtainCommitsOfRepo(): Promise<CommitDataObject[]> {
    throw new Error("no commits");
  }
  obtainRunsOfGithubActions(): any {
    return {};
  }

  async obtainJobsOfRepo(): Promise<JobDataObject[]> {
    throw new Error("no jobs");
  }
}
