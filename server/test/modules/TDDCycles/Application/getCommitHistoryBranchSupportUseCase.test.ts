import { GetCommitHistoryBranchSupportUseCase } from "../../../../src/modules/TDDCycles/Application/getCommitHistoryBranchSupportUseCase";
import { IGithubRepositoryBranchSupport } from "../../../../src/modules/TDDCycles/Domain/IGithubRepositoryBranchSupport";
import { CommitHistoryDataBranchSupport } from "../../../../src/modules/TDDCycles/Domain/ICommitHistoryDataBranchSupport";

describe("GetCommitHistoryBranchSupportUseCase", () => {
  let mockRepo: jest.Mocked<IGithubRepositoryBranchSupport>;
  let useCase: GetCommitHistoryBranchSupportUseCase;

  beforeEach(() => {
    mockRepo = {
      getCommitHistoryData: jest.fn(),
      getCommitCyclesData: jest.fn(),
      getProjectBranches: jest.fn(),
    };
    useCase = new GetCommitHistoryBranchSupportUseCase(mockRepo);
  });

  it("should delegate execution to repository with optional branch", async () => {
    const mockCommits: CommitHistoryDataBranchSupport[] = [
      {
        sha: "abc",
        html_url: "https://github.com/o/r/commit/abc",
        stats: { total: 10, additions: 5, deletions: 5, date: "2024-01-01" },
        commit: {
          date: new Date(),
          message: "test",
          url: "https://github.com/o/r/commit/abc",
          comment_count: 0,
        },
        coverage: 80,
        test_count: 2,
        conclusion: "success",
        branches: ["main"],
        primary_branch: "main",
        parents: [],
      },
    ];

    mockRepo.getCommitHistoryData.mockResolvedValue(mockCommits);

    const result = await useCase.execute("owner", "repo", "main");
    expect(result).toBe(mockCommits);
    expect(mockRepo.getCommitHistoryData).toHaveBeenCalledWith("owner", "repo", "main");
  });
});
