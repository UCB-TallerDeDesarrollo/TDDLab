import { IGithubRepository } from "../Domain/IGithubRepository";
import { IBranchRepository } from "../Domain/IBranchRepository";
import { CommitCycleData } from "../Domain/ICommitCycleData";

export class GetCommitCyclesUseCase {
  private readonly githubRepository: IGithubRepository;
  private readonly branchRepository: IBranchRepository | null;

  constructor(githubRepository: IGithubRepository, branchRepository?: IBranchRepository) {
    this.githubRepository = githubRepository;
    this.branchRepository = branchRepository ?? null;
  }

  async execute(owner: string, repoName: string): Promise<CommitCycleData[]> {
    try {
      const useNewGen = await this.githubRepository.checkNewGenFile(
        owner,
        repoName
      );

      if (useNewGen && this.branchRepository) {
        const history = await this.branchRepository.getBranchHistory(
          owner,
          repoName,
          "main"
        );
        return history?.commits?.map((c) => ({
          repository_slug: c.repository_slug,
          branch: c.branch,
          url: c.html_url,
          sha: c.sha,
          tddCycle: c.commit?.message ?? "null",
          coverage: c.coverage,
        })) ?? [];
      }

      // Legacy: archivo commit-history.json de GitHub (ya maneja 404 devolviendo [])
      return await this.githubRepository.getCommitCyclesData(owner, repoName);
    } catch (error) {
      console.error(`Error executing GetCommitCyclesUseCase: ${error}`);
      return [];
    }
  }
}
