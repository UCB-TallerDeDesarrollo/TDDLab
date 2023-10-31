import { GithubAPIRepository } from "../../../../src/modules/TDDCycles-Visualization/domain/GithubAPIRepositoryInterface";
import { CommitDataObject } from "../../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../../src/modules/TDDCycles-Visualization/domain/jobInterfaces";

export class MockGithubAPI implements GithubAPIRepository {
  async obtainCommitsOfRepo(): Promise<CommitDataObject[]> {
    let commits = [
      {
        html_url: "https://github.com/example/repo/commit/abc123",
        stats: {
          total: 10,
          additions: 5,
          deletions: 5,
        },
        commit: {
          date: new Date(),
          message: "Commit message",
          url: "https://github.com/example/repo/commit/abc123",
          comment_count: 0,
        },
        sha: "abc123",
      },
    ];
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
