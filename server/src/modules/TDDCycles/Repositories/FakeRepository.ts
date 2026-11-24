import { ITDDVisualizationRepository } from "../Domain/ITDDVisualizationRepository";
import {
  createFakeTDDData,
  createRichFakeTDDData,
  fakeRichTDDRepository,
  fakeTDDRepository,
} from "./fakeTDDData";

export class FakeRepository implements ITDDVisualizationRepository {
  private readonly datasets = new Map([
    [`${fakeTDDRepository.owner}/${fakeTDDRepository.repoName}`, createFakeTDDData()],
    [`${fakeRichTDDRepository.owner}/${fakeRichTDDRepository.repoName}`, createRichFakeTDDData()],
  ]);

  private getDataset(owner: string, repoName: string) {
    return this.datasets.get(`${owner}/${repoName}`);
  }

  async getCommitHistoryData(owner: string, repoName: string) {
    const dataset = this.getDataset(owner, repoName);
    return dataset ? structuredClone(dataset.commits) : [];
  }

  async getCommitCyclesData(owner: string, repoName: string) {
    const dataset = this.getDataset(owner, repoName);
    return dataset ? structuredClone(dataset.cycles) : [];
  }

  async getTDDLogs(owner: string, repoName: string) {
    const dataset = this.getDataset(owner, repoName);
    return dataset ? structuredClone(dataset.logs) : [];
  }
}
