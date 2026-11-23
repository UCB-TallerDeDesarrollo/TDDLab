import { GetTopologyGraphBranchSupportUseCase } from "../../../../src/modules/TDDCycles/Application/getTopologyGraphBranchSupportUseCase";
import { IGithubRepositoryBranchSupport } from "../../../../src/modules/TDDCycles/Domain/IGithubRepositoryBranchSupport";
import { TopologyGraphResponseBranchSupport } from "../../../../src/modules/TDDCycles/Domain/ITopologyGraphBranchSupport";

describe("GetTopologyGraphBranchSupportUseCase", () => {
  let mockRepo: jest.Mocked<IGithubRepositoryBranchSupport>;
  let useCase: GetTopologyGraphBranchSupportUseCase;

  beforeEach(() => {
    mockRepo = {
      getCommitHistoryData: jest.fn(),
      getCommitCyclesData: jest.fn(),
      getProjectBranches: jest.fn(),
      getTestExecutions: jest.fn(),
      getTopologyGraph: jest.fn(),
    };
    useCase = new GetTopologyGraphBranchSupportUseCase(mockRepo);
  });

  it("should delegate execution to repository getTopologyGraph", async () => {
    const mockTopology: TopologyGraphResponseBranchSupport = {
      project_id: "1",
      default_branch: "main",
      branches: [],
      nodes: [],
      edges: [],
    };

    mockRepo.getTopologyGraph.mockResolvedValue(mockTopology);

    const result = await useCase.execute("owner", "repo");
    expect(result).toBe(mockTopology);
    expect(mockRepo.getTopologyGraph).toHaveBeenCalledWith("owner", "repo");
  });
});
