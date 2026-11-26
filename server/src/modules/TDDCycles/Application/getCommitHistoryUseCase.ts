import { IGithubRepository } from "../Domain/IGithubRepository";
import { IBranchRepository } from "../Domain/IBranchRepository";
import { CommitHistoryData } from "../Domain/ICommitHistoryData";

export class GetCommitHistoryUseCase {
  private readonly githubRepository: IGithubRepository;
  private readonly branchRepository: IBranchRepository | null;

  constructor(githubRepository: IGithubRepository, branchRepository?: IBranchRepository) {
    this.githubRepository = githubRepository;
    this.branchRepository = branchRepository ?? null;
  }

  async execute(owner: string, repoName: string, branch?: string): Promise<CommitHistoryData[]> {
    try {
      const useNewGen = await this.githubRepository.checkNewGenFile(
        owner,
        repoName
      );

      if (useNewGen && this.branchRepository) {
        // Nuevo modelo: obtener commits de la rama especificada desde BD
        const targetBranch = branch ?? "main";
        const history = await this.branchRepository.getBranchHistory(
          owner,
          repoName,
          targetBranch
        );
        return history?.commits ?? [];
      }

      // Legacy: archivo commit-history.json de GitHub (ya maneja 404 devolviendo [])
      return await this.githubRepository.getCommitHistoryData(owner, repoName);
    } catch (error) {
      console.error(`Error executing GetCommitHistoryUseCase: ${error}`);
      return [];
    }
  }
}
