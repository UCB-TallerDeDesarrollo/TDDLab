import { BranchSupportController } from "../../src/controllers/BranchSupport/BranchSupportController";
import { ProjectUseCases } from "../../src/modules/BranchSupport/Application/ProjectUseCases";
import { BranchUseCases } from "../../src/modules/BranchSupport/Application/BranchUseCases";
import { CommitUseCases } from "../../src/modules/BranchSupport/Application/CommitUseCases";
import { TestExecutionUseCases } from "../../src/modules/BranchSupport/Application/TestExecutionUseCases";
import { GraphDataUseCases } from "../../src/modules/BranchSupport/Application/GraphDataUseCases";
import { SchemaSetupUseCase } from "../../src/modules/BranchSupport/Application/SchemaSetupUseCase";
import { IBranchSupportRepository } from "../../src/modules/BranchSupport/Repositories/IBranchSupportRepository";

describe("BranchSupportController", () => {
  let mockRepo: jest.Mocked<IBranchSupportRepository>;
  let controller: BranchSupportController;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    mockRepo = {
      initSchema: jest.fn(),
      createProject: jest.fn(),
      getProjectById: jest.fn(),
      getProjectsByUser: jest.fn(),
      updateProject: jest.fn(),
      deleteProject: jest.fn(),
      createBranch: jest.fn(),
      getBranchById: jest.fn(),
      getBranchesByProject: jest.fn(),
      updateBranchHead: jest.fn(),
      updateBranch: jest.fn(),
      softDeleteBranch: jest.fn(),
      createCommit: jest.fn(),
      getCommitsByProject: jest.fn(),
      getCommitBySha: jest.fn(),
      createTestExecution: jest.fn(),
      getTestExecutionsByProject: jest.fn(),
      getTestExecutionById: jest.fn(),
      getTopologyGraph: jest.fn(),
      getTestMetricsGraph: jest.fn(),
      getTDDCyclesGraph: jest.fn(),
    };

    controller = new BranchSupportController(
      new ProjectUseCases(mockRepo),
      new BranchUseCases(mockRepo),
      new CommitUseCases(mockRepo),
      new TestExecutionUseCases(mockRepo),
      new GraphDataUseCases(mockRepo),
      new SchemaSetupUseCase(mockRepo)
    );
  });

  describe("Projects", () => {
    it("should create project using user / github_user param", async () => {
      const req: any = {
        body: {
          name: "Repo 1",
          link: "https://github.com/octocat/repo1",
          user: "octocat",
        },
        query: {},
      };
      const res = mockResponse();

      mockRepo.createProject.mockResolvedValue({
        id: "1",
        name: "Repo 1",
        link: "https://github.com/octocat/repo1",
        github_user: "octocat",
        created_at: new Date(),
      });

      await controller.createProject(req, res);

      expect(mockRepo.createProject).toHaveBeenCalledWith({
        name: "Repo 1",
        link: "https://github.com/octocat/repo1",
        github_user: "octocat",
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should list projects for a user", async () => {
      const req: any = { query: { user: "octocat" } };
      const res = mockResponse();

      mockRepo.getProjectsByUser.mockResolvedValue([]);
      await controller.getProjects(req, res);

      expect(mockRepo.getProjectsByUser).toHaveBeenCalledWith("octocat");
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("Branches", () => {
    it("should create a branch for a project", async () => {
      const req: any = {
        params: { projectId: "1" },
        body: { name: "feature/login" },
      };
      const res = mockResponse();

      mockRepo.createBranch.mockResolvedValue({
        id: "10",
        project_id: "1",
        name: "feature/login",
        head_commit_sha: null,
        fork_commit_sha: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await controller.createBranch(req, res);

      expect(mockRepo.createBranch).toHaveBeenCalledWith({
        project_id: "1",
        name: "feature/login",
        head_commit_sha: undefined,
        fork_commit_sha: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("Commits", () => {
    it("should register a commit with parents and branch info", async () => {
      const req: any = {
        params: { projectId: "1" },
        body: {
          sha: "abc1234",
          author: "octocat",
          message: "test: add first test",
          committed_at: new Date().toISOString(),
          branch_id: "10",
          parent_shas: ["root123"],
          additions: 10,
          deletions: 2,
        },
      };
      const res = mockResponse();

      mockRepo.createCommit.mockResolvedValue({
        project_id: "1",
        sha: "abc1234",
        author: "octocat",
        message: "test: add first test",
        committed_at: new Date(),
        additions: 10,
        deletions: 2,
        changed_files: 1,
      });

      await controller.createCommit(req, res);

      expect(mockRepo.createCommit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("Test Executions", () => {
    it("should register test execution with results", async () => {
      const req: any = {
        params: { projectId: "1" },
        body: {
          branch_id: "10",
          commit_sha: "abc1234",
          total_tests: 5,
          passed_tests: 4,
          failed_tests: 1,
          conclusion: "failure",
          coverage: 80.5,
          results: [
            {
              test_name: "login test",
              status: "failed",
              error_message: "expected 200 got 500",
            },
          ],
        },
      };
      const res = mockResponse();

      mockRepo.createTestExecution.mockResolvedValue({
        id: "100",
        project_id: "1",
        branch_id: "10",
        commit_sha: "abc1234",
        source: "local",
        executed_at: new Date(),
        total_tests: 5,
        passed_tests: 4,
        failed_tests: 1,
        skipped_tests: 0,
        error_tests: 0,
        coverage: 80.5,
        conclusion: "failure",
      });

      await controller.createTestExecution(req, res);

      expect(mockRepo.createTestExecution).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("Graphs", () => {
    it("should return topology graph data for git graph visualization", async () => {
      const req: any = { params: { projectId: "1" } };
      const res = mockResponse();

      mockRepo.getTopologyGraph.mockResolvedValue({
        project_id: "1",
        branches: [],
        nodes: [],
        edges: [],
      });

      await controller.getTopologyGraph(req, res);

      expect(mockRepo.getTopologyGraph).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return test metrics graph data", async () => {
      const req: any = { params: { projectId: "1" } };
      const res = mockResponse();

      mockRepo.getTestMetricsGraph.mockResolvedValue({
        project_id: "1",
        timeline: [],
        branch_summaries: {},
      });

      await controller.getTestMetricsGraph(req, res);

      expect(mockRepo.getTestMetricsGraph).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("Schema Setup", () => {
    it("should call initSchema and return 200", async () => {
      const req: any = {};
      const res = mockResponse();

      mockRepo.initSchema.mockResolvedValue();

      await controller.setupSchema(req, res);

      expect(mockRepo.initSchema).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
