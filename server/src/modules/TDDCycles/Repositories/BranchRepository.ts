import { IGithubRepository } from "../Domain/IGithubRepository";

export class BranchRepository implements IGithubRepository {
  getCommits(owner: string, repoName: string) {}
  getCommitInfoForTDDCycle(owner: string, repoName: string, sha: string) {}
}
