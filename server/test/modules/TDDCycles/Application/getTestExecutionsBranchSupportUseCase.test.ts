import { GetTestExecutionsBranchSupportUseCase } from "../../../../src/modules/TDDCycles/Application/getTestExecutionsBranchSupportUseCase";
import { IGithubRepositoryBranchSupport } from "../../../../src/modules/TDDCycles/Domain/IGithubRepositoryBranchSupport";
import { TestExecutionDataBranchSupport } from "../../../../src/modules/TDDCycles/Domain/ITestExecutionDataBranchSupport";

describe("GetTestExecutionsBranchSupportUseCase", () => {
  let mockRepo: jest.Mocked<IGithubRepositoryBranchSupport>;
  let useCase: GetTestExecutionsBranchSupportUseCase;

  beforeEach(() => {
    mockRepo = {
      getCommitHistoryData: jest.fn(),
      getCommitCyclesData: jest.fn(),
      getProjectBranches: jest.fn(),
      getTestExecutions: jest.fn(),
      getTopologyGraph: jest.fn(),
    };
    useCase = new GetTestExecutionsBranchSupportUseCase(mockRepo);
  });

  it("should delegate execution to repository with optional branch and commitSha", async () => {
    const mockExecutions: TestExecutionDataBranchSupport[] = [
      {
        id: "1",
        commit_sha: "abc",
        branch_id: "1",
        branch_name: "main",
        source: "local",
        executed_at: new Date(),
        timestamp: 123456789,
        total_tests: 10,
        passed_tests: 10,
        failed_tests: 0,
        skipped_tests: 0,
        error_tests: 0,
        coverage: 95,
        duration_ms: 100,
        conclusion: "success",
        success: true,
        numTotalTests: 10,
        numPassedTests: 10,
        testId: 1,
      },
    ];

    mockRepo.getTestExecutions.mockResolvedValue(mockExecutions);

    const result = await useCase.execute("owner", "repo", "main", "abc");
    expect(result).toBe(mockExecutions);
    expect(mockRepo.getTestExecutions).toHaveBeenCalledWith("owner", "repo", "main", "abc");
  });
});
