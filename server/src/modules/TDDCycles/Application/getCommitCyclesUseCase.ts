import { ITDDVisualizationRepository } from "../Domain/ITDDVisualizationRepository";
import { CommitCycleData } from "../Domain/ICommitCycleData";

export class GetCommitCyclesUseCase {
  constructor(private readonly repository: ITDDVisualizationRepository) {}

  async execute(owner: string, repoName: string): Promise<CommitCycleData[]> {
    return this.repository.getCommitCyclesData(owner, repoName);
  }
}
