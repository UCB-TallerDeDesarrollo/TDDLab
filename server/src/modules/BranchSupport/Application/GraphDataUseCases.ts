import { IBranchSupportRepository } from "../Repositories/IBranchSupportRepository";
import {
  TopologyGraphResponse,
  TestMetricsGraphResponse,
  TDDCyclePoint,
} from "../Domain/IGraphData";

export class GraphDataUseCases {
  constructor(private readonly repository: IBranchSupportRepository) {}

  async getTopologyGraph(projectId: string): Promise<TopologyGraphResponse> {
    if (!projectId) {
      throw new Error("Missing required field: projectId");
    }
    return await this.repository.getTopologyGraph(projectId);
  }

  async getTestMetricsGraph(projectId: string): Promise<TestMetricsGraphResponse> {
    if (!projectId) {
      throw new Error("Missing required field: projectId");
    }
    return await this.repository.getTestMetricsGraph(projectId);
  }

  async getTDDCyclesGraph(
    projectId: string,
    branchId?: string
  ): Promise<TDDCyclePoint[]> {
    if (!projectId) {
      throw new Error("Missing required field: projectId");
    }
    return await this.repository.getTDDCyclesGraph(projectId, branchId);
  }
}
