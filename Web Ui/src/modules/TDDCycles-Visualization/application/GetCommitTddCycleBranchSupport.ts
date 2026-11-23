import { CommitHistoryRepositoryBranchSupport } from "../domain/CommitHistoryRepositoryInterfaceBranchSupport";
import { CommitCycleBranchSupport } from "../domain/TddCycleInterfaceBranchSupport";

export class GetCommitTddCycleBranchSupport {
  constructor(private readonly repository: CommitHistoryRepositoryBranchSupport) {}

  async execute(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitCycleBranchSupport[]> {
    return await this.repository.obtainCommitTddCycle(owner, repoName, branch);
  }
}
