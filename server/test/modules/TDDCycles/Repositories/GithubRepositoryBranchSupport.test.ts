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

  describe("getTestExecutions", () => {
    it("should default to main and return formatted test executions", async () => {
      // 1. Branch query for resolveEffectiveBranch
      mockClient.query.mockResolvedValueOnce({
        rows: [{ name: "main" }, { name: "dev" }],
      });
      // 2. Test executions query
      mockClient.query.mockResolvedValueOnce({
        rows: [
          {
            id: "1",
            commit_sha: "sha1",
            branch_id: "10",
            branch_name: "main",
            source: "local",
            executed_at: new Date("2024-03-01T10:05:00Z"),
            total_tests: 5,
            passed_tests: 4,
            failed_tests: 1,
            skipped_tests: 0,
            error_tests: 0,
            coverage: 80,
            duration_ms: 120,
            conclusion: "failure",
          },
        ],
      });

      const executions = await repository.getTestExecutions("user1", "my-repo");

      expect(executions).toHaveLength(1);
      expect(executions[0].id).toBe("1");
      expect(executions[0].commit_sha).toBe("sha1");
      expect(executions[0].branch_name).toBe("main");
      expect(executions[0].numTotalTests).toBe(5);
      expect(executions[0].numPassedTests).toBe(4);
      expect(executions[0].failed_tests).toBe(1);
      expect(executions[0].success).toBe(false);
      expect(executions[0].conclusion).toBe("failure");
    });
  });

  describe("getCommitHistoryData", () => {
    it("should default to main branch when branch is not provided", async () => {
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

      // 1. Resolve branch query -> main
      mockClient.query.mockResolvedValueOnce({ rows: [{ name: "main" }] });
      // 2. Commits query
      mockClient.query.mockResolvedValueOnce({ rows: mockRows });
      // 3. Resolve branch query for test executions
      mockClient.query.mockResolvedValueOnce({ rows: [{ name: "main" }] });
      // 4. Test executions query
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await repository.getCommitHistoryData("user1", "my-repo");

      expect(result).toHaveLength(1);
      expect(result[0].sha).toBe("sha1");
      expect(result[0].primary_branch).toBe("main");
      expect(result[0].stats.total).toBe(60);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("should pass explicit branch parameter when specified", async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });
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

      // 1. Resolve branch query -> main
      mockClient.query.mockResolvedValueOnce({ rows: [{ name: "main" }] });
      // 2. Commits query
      mockClient.query.mockResolvedValueOnce({ rows: mockRows });
      // 3. Resolve branch query for test executions
      mockClient.query.mockResolvedValueOnce({ rows: [{ name: "main" }] });
      // 4. Test executions query
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const cycles = await repository.getCommitCyclesData("user1", "my-repo");

      expect(cycles).toHaveLength(2);
      expect(cycles[1].tddCycle).toBe("red");
      expect(cycles[0].tddCycle).toBe("refactor");
    });
  });

  describe("getTopologyGraph", () => {
    it("should return the multibranch DAG nodes, edges, and branches with default branch main", async () => {
      // 1. Project ID resolution
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: "42" }] });

      // 2. Branches query
      mockClient.query.mockResolvedValueOnce({
        rows: [
          {
            id: "1",
            name: "main",
            head_commit_sha: "sha2",
            fork_commit_sha: null,
            created_at: new Date("2024-01-01"),
            updated_at: new Date("2024-01-02"),
            total_commits: 2,
          },
          {
            id: "2",
            name: "feature/auth",
            head_commit_sha: "sha3",
            fork_commit_sha: "sha1",
            created_at: new Date("2024-01-02"),
            updated_at: new Date("2024-01-03"),
            total_commits: 1,
          },
        ],
      });

      // 3. Nodes query
      mockClient.query.mockResolvedValueOnce({
        rows: [
          {
            sha: "sha1",
            author: "Dev",
            author_email: "dev@example.com",
            message: "Initial commit",
            committed_at: new Date("2024-01-01T10:00:00Z"),
            additions: 100,
            deletions: 0,
            total_changes: 100,
            changed_files: 5,
            branches: ["main"],
            parents: [],
            test_runs_count: 2,
            latest_conclusion: "success",
            latest_coverage: 90,
          },
          {
            sha: "sha2",
            author: "Dev",
            author_email: "dev@example.com",
            message: "Main commit 2",
            committed_at: new Date("2024-01-02T10:00:00Z"),
            additions: 20,
            deletions: 5,
            total_changes: 25,
            changed_files: 2,
            branches: ["main"],
            parents: ["sha1"],
            test_runs_count: 1,
            latest_conclusion: "success",
            latest_coverage: 92,
          },
        ],
      });

      // 4. Edges query
      mockClient.query.mockResolvedValueOnce({
        rows: [
          { parent_sha: "sha1", child_sha: "sha2", parent_order: 1 },
        ],
      });

      const topology = await repository.getTopologyGraph("user1", "my-repo");

      expect(topology.project_id).toBe("42");
      expect(topology.default_branch).toBe("main");
      expect(topology.branches).toHaveLength(2);
      expect(topology.branches[0].is_default).toBe(true);
      expect(topology.nodes).toHaveLength(2);
      expect(topology.edges).toHaveLength(1);
      expect(topology.edges[0].parent_sha).toBe("sha1");
      expect(topology.edges[0].child_sha).toBe("sha2");
    });
  });
});
