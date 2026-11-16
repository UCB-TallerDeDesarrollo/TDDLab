import { ITDDVisualizationRepository } from "../Domain/ITDDVisualizationRepository";

export class GetTDDLogsUseCase {
  constructor(private readonly repository: ITDDVisualizationRepository) {}

  execute(owner: string, repoName: string) {
    return this.repository.getTDDLogs(owner, repoName);
  }
}
