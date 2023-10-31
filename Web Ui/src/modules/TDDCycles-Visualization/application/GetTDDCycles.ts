import { GithubAPIRepository } from "../domain/GithubAPIRepositoryInterface";
import { CommitDataObject } from "../domain/githubCommitInterfaces";
import { JobDataObject } from "../domain/jobInterfaces";

export class PortGetTDDCycles {
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

  async obtainJobsData(
    owner: string,
    repoName: string
  ): Promise<JobDataObject[]> {
    return await this.adapter.obtainJobsOfRepo(owner, repoName);
  }
}
