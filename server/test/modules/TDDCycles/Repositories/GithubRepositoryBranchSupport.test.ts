import { GithubRepositoryBranchSupport } from "../../../../src/modules/TDDCycles/Repositories/GithubRepositoryBranchSupport";

describe("GithubRepositoryBranchSupport", () => {
  let mockPool: any;
  let mockClient: any;
  let repository: GithubRepositoryBranchSupport;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    };
    repository = new GithubRepositoryBranchSupport(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getProjectBranches", () => {
    it("should return branch names for the project", async () => {
      mockClient.query.mockResolvedValueOnce({
        rows: [{ name: "dev" }, { name: "feature/login" }, { name: "main" }],
      });

      const branches = await repository.getProjectBranches("user1", "my-repo");
      expect(branches).toEqual(["dev", "feature/login", "main"]);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT DISTINCT b.name"),
        ["user1", "my-repo"]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe("getCommitHistoryData", () => {
    it("should map database rows to CommitHistoryDataBranchSupport without branch filter", async () => {
      const mockRows = [
        {
          sha: "sha1",
          author: "Developer 1",
          author_email: "dev1@example.com",
          message: "feat: initial commit",
          committed_at: new Date("2024-03-01T10:00:00Z"),
          additions: 50,
          deletions: 10,
          total_changes: 60,
          changed_files: 3,
          repo_url: "https://github.com/user1/my-repo",
          branches: ["main"],
          parents: [],
          total_tests: 10,
          passed_tests: 10,
          failed_tests: 0,
          coverage: 85,
          conclusion: "success",
        },
      ];

      mockClient.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await repository.getCommitHistoryData("user1", "my-repo");

      expect(result).toHaveLength(1);
      expect(result[0].sha).toBe("sha1");
      expect(result[0].branches).toEqual(["main"]);
      expect(result[0].primary_branch).toBe("main");
      expect(result[0].test_count).toBe(10);
      expect(result[0].conclusion).toBe("success");
      expect(result[0].stats.total).toBe(60);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("should pass branch parameter into query when filtering by branch", async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      await repository.getCommitHistoryData("user1", "my-repo", "feature-branch");

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining("AND b2.name = $3"),
        ["user1", "my-repo", "feature-branch"]
      );
    });
  });

  describe("getCommitCyclesData", () => {
    it("should compute red/green/refactor TDD cycles", async () => {
      const mockRows = [
        {
          sha: "sha2",
          author: "Developer 1",
          message: "refactor: clean up methods",
          committed_at: new Date("2024-03-01T12:00:00Z"),
          additions: 10,
          deletions: 5,
          total_changes: 15,
          repo_url: "https://github.com/user1/my-repo",
          branches: ["main"],
          parents: ["sha1"],
          total_tests: 5,
          passed_tests: 5,
          failed_tests: 0,
          coverage: 90,
          conclusion: "success",
        },
        {
          sha: "sha1",
          author: "Developer 1",
          message: "feat: failing test",
          committed_at: new Date("2024-03-01T11:00:00Z"),
          additions: 20,
          deletions: 0,
          total_changes: 20,
          repo_url: "https://github.com/user1/my-repo",
          branches: ["main"],
          parents: [],
          total_tests: 5,
          passed_tests: 3,
          failed_tests: 2,
          coverage: 60,
          conclusion: "failure",
        },
      ];

      mockClient.query.mockResolvedValueOnce({ rows: mockRows });

      const cycles = await repository.getCommitCyclesData("user1", "my-repo");

      expect(cycles).toHaveLength(2);
      expect(cycles[1].tddCycle).toBe("red");
      expect(cycles[0].tddCycle).toBe("refactor");
    });
  });
});
