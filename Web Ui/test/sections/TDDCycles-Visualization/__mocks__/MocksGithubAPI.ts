import { ComplexityObject } from "../../../../src/modules/TDDCycles-Visualization/domain/ComplexityInterface";
import { GithubAPIRepository } from "../../../../src/modules/TDDCycles-Visualization/domain/GithubAPIRepositoryInterface";
import { CommitDataObject } from "../../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../../src/modules/TDDCycles-Visualization/domain/jobInterfaces";
import { CommitCycle } from "../../../../src/modules/TDDCycles-Visualization/domain/TddCycleInterface";
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
  async obtainComplexityOfRepo(): Promise<ComplexityObject[]> {
    let jobs: ComplexityObject[] = [];

    return jobs;
  }

  async obtainCommitTddCycle(): Promise<CommitCycle[]> {
    let commitscycles: CommitCycle[] = [];
    return commitscycles;
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
  async obtainComplexityOfRepo(): Promise<ComplexityObject[]> {
    let jobs: ComplexityObject[] = [];

    return jobs;
  }

  async obtainCommitTddCycle(): Promise<CommitCycle[]> {
    let commitscycles: CommitCycle[] = [];
    return commitscycles;
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
  async obtainComplexityOfRepo(): Promise<ComplexityObject[]> {
    let jobs: ComplexityObject[] = [];

    return jobs;
  }

  async obtainCommitTddCycle(): Promise<CommitCycle[]> {
    let commitscycles: CommitCycle[] = [];
    return commitscycles;
  }
  
}
