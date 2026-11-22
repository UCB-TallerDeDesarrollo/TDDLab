import { IGithubRepository } from "../Domain/IGithubRepository";
import { IBranchRepository } from "../Domain/IBranchRepository";
import { BranchData } from "../Domain/BranchData";
import { BranchHistoryData } from "../Domain/BranchData";

export class GetBranchHistoryUseCase {
  private readonly githubRepository: IGithubRepository;
  private readonly branchRepository: IBranchRepository;

  constructor(githubRepository: IGithubRepository, branchRepository: IBranchRepository) {
    this.githubRepository = githubRepository;
    this.branchRepository = branchRepository;
  }

  async execute(owner: string, repoName: string, branch: string): Promise<BranchHistoryData | null> {
    try {
      const useNewGen = await this.githubRepository.checkNewGenFile(owner, repoName);

      if (useNewGen) {
        return await this.branchRepository.getBranchHistory(owner, repoName, branch);
      }

      const commitHistory = await this.githubRepository.getCommitHistoryData(owner, repoName);
      const branchCommits = commitHistory.filter((c) => c.branch === branch);
      const defaultBranch: BranchData = {
        repository_slug: `${owner}/${repoName}`,
        name: branch,
        fork_commit_sha: "",
        created_at: new Date(),
        commit_count: branchCommits.length,
        last_commit_sha: branchCommits.length > 0 ? branchCommits[0].sha : "",
        last_commit_at: branchCommits.length > 0 ? branchCommits[0].commit.date : new Date(),
        merge_into: "",
      };
      return {
        branch: defaultBranch,
        commits: branchCommits,
      };
    } catch (error) {
      console.error(`Error executing GetBranchHistoryUseCase: ${error}`);
      throw error;
    }
  }
}
