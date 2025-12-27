import { IGithubRepository } from "../Domain/IGithubRepository";
import { IDBBranchWithCommits } from "../Domain/IDBBranchWithCommits";

export class GetAvailableBranchesUseCase {
  constructor(private githubRepository: IGithubRepository) {}

  async execute(owner: string, repoName: string): Promise<IDBBranchWithCommits[]> {
    return await this.githubRepository.getAvailableBranches(owner, repoName);
  }
}
