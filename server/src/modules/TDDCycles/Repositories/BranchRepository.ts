import { IGithubRepository } from "../Domain/IGithubRepository";
import { CommitDataObject } from "../Domain/CommitDataObject";
import { CommitInformationDataObject } from "../Domain/CommitDataObject";

export class BranchRepository implements IGithubRepository {
  async getCommits(_owner: string, _repoName: string): Promise<CommitDataObject[]> {
    return [];
  }
  async getCommitInfoForTDDCycle(_owner: string, _repoName: string, _sha: string): Promise<CommitInformationDataObject> {
    throw new Error("Method not implemented.");
  }
  async getCommitsInforForTDDCycle(_owner: string, _repoName: string, _commits: CommitDataObject[]): Promise<any> {
    return [];
  }
  async timeout(ms: number): Promise<void> {
    return new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Request timed out"));
      }, ms);
    });
  }
  async obtainRunsOfGithubActions(_owner: string, _repoName: string): Promise<any> {
    return {};
  }
  async obtainJobsOfACommit(_owner: string, _repoName: string, _jobId: number, _attempt: number): Promise<any> {
    return {};
  }
  async getRunsOfGithubActionsIds(_owner: string, _repoName: string): Promise<[string, number][]> {
    return [];
  }
  async getJobsDataFromGithub(_owner: string, _repoName: string, _listOfCommitsWithActions: [string, number][]): Promise<Record<string, any>> {
    return {};
  }
  async fetchCoverageDataForCommit(_owner: string, _repoName: string, _sha: string): Promise<any> {
    return {};
  }
  async fetchCommitHistoryJson(_owner: string, _repoName: string): Promise<any[]> {
    return [];
  }
  async getCommitHistoryData(_owner: string, _repoName: string): Promise<any[]> {
    return [];
  }
  async getCommitCyclesData(_owner: string, _repoName: string): Promise<any[]> {
    return [];
  }
  async checkNewGenFile(_owner: string, _repoName: string): Promise<boolean> {
    return false;
  }
}
