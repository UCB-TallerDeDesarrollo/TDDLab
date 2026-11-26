import { IGithubRepositoryBranchSupport } from "../Domain/IGithubRepositoryBranchSupport";
import { TopologyGraphResponseBranchSupport } from "../Domain/ITopologyGraphBranchSupport";

export class GetTopologyGraphBranchSupportUseCase {
  constructor(private readonly repository: IGithubRepositoryBranchSupport) {}

  async execute(owner: string, repoName: string): Promise<TopologyGraphResponseBranchSupport> {
    try {
      return await this.repository.getTopologyGraph(owner, repoName);
    } catch (error) {
      console.error(`Error executing GetTopologyGraphBranchSupportUseCase: ${error}`);
      throw error;
    }
  }
}
