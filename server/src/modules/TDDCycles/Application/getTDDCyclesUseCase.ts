import { IDBCommitsRepository } from "../Domain/IDBCommitsRepository";
import { IGithubRepository } from "../Domain/IGithubRepository";
export class GetTDDCyclesUseCase {
  private dbCommitRepository: IDBCommitsRepository;
  private githubRepository: IGithubRepository;

  constructor(
    dbCommitRepository: IDBCommitsRepository,
    githubRepository: IGithubRepository
  ) {
    this.dbCommitRepository = dbCommitRepository;
    this.githubRepository = githubRepository;
  }
  async execute(owner: string, repoName: string) {
    try {
      const commitsFromGithub = await this.githubRepository.getCommits(
        owner,
        repoName
      );
      let commitsToSave = commitsFromGithub;
      if (await this.dbCommitRepository.repositoryExists(owner, repoName)) {
        commitsToSave = await this.dbCommitRepository.getCommitsNotSaved(
          owner,
          repoName,
          commitsFromGithub
        );
      }
      const commitsInfoForTDDCycles =
        await this.githubRepository.getCommitsInforForTDDCycle(
          owner,
          repoName,
          commitsToSave
        );
      await this.dbCommitRepository.saveCommitsList(
        owner,
        repoName,
        commitsInfoForTDDCycles
      );
      const commits = await this.dbCommitRepository.getCommits(owner, repoName);
      return commits;
    } catch (error) {
      throw error;
    }
  }
}
