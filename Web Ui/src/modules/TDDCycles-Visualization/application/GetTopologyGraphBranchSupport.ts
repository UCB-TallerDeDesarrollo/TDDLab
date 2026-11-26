import { CommitHistoryRepositoryBranchSupport } from "../domain/CommitHistoryRepositoryInterfaceBranchSupport";
import { TopologyGraphResponseBranchSupport } from "../domain/ITopologyGraphBranchSupport";

export class GetTopologyGraphBranchSupport {
  constructor(private readonly repository: CommitHistoryRepositoryBranchSupport) {}

  async execute(owner: string, repoName: string): Promise<TopologyGraphResponseBranchSupport> {
    return await this.repository.obtainTopologyGraph(owner, repoName);
  }
}
