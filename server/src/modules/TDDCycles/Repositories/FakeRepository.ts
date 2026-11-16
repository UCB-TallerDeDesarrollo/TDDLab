import { ITDDVisualizationRepository } from "../Domain/ITDDVisualizationRepository";
import { createFakeTDDData, fakeTDDRepository } from "./fakeTDDData";

export class FakeRepository implements ITDDVisualizationRepository {
  private readonly data = createFakeTDDData();

  private matches(owner: string, repoName: string) {
    return owner === fakeTDDRepository.owner && repoName === fakeTDDRepository.repoName;
  }

  async getCommitHistoryData(owner: string, repoName: string) {
    return this.matches(owner, repoName) ? structuredClone(this.data.commits) : [];
  }

  async getCommitCyclesData(owner: string, repoName: string) {
    return this.matches(owner, repoName) ? structuredClone(this.data.cycles) : [];
  }

  async getTDDLogs(owner: string, repoName: string) {
    return this.matches(owner, repoName) ? structuredClone(this.data.logs) : [];
  }
}
