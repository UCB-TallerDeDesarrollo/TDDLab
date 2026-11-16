import { ITDDVisualizationRepository } from "../Domain/ITDDVisualizationRepository";
import { CommitHistoryData } from "../Domain/ICommitHistoryData";

export class GetCommitHistoryUseCase {
  constructor(private readonly repository: ITDDVisualizationRepository) {}

  async execute(owner: string, repoName: string): Promise<CommitHistoryData[]> {
    return this.repository.getCommitHistoryData(owner, repoName);
  }
}
