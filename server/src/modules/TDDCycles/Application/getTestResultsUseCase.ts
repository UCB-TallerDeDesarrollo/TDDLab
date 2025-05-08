import { IGithubRepository } from "../Domain/IGithubRepository";

export class GetTestResultsUseCase {
  private readonly githubRepository: IGithubRepository;

  constructor(
    githubRepository: IGithubRepository
  ) {
    this.githubRepository = githubRepository;
  }
  async execute(owner: string, repoName: string) {
    try {
      const githubActionsRunsList = await this.githubRepository.getRunsOfGithubActionsIds(owner, repoName);
      return githubActionsRunsList;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
}