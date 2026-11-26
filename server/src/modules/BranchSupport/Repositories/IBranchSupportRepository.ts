import { Project, CreateProjectDTO, UpdateProjectDTO } from "../Domain/IProject";
import { GitCommit, CreateCommitDTO } from "../Domain/IGitCommit";
import { Branch, CreateBranchDTO, UpdateBranchDTO } from "../Domain/IBranch";
import {
  TestExecution,
  TestResult,
  CreateTestExecutionDTO,
} from "../Domain/ITestExecution";
import {
  TopologyGraphResponse,
  TestMetricsGraphResponse,
  TDDCyclePoint,
} from "../Domain/IGraphData";

export interface IBranchSupportRepository {
  // Schema setup
  initSchema(): Promise<void>;

  // Project
  createProject(dto: CreateProjectDTO): Promise<Project>;
  getProjectById(id: string): Promise<Project | null>;
  getProjectsByUser(githubUser?: string): Promise<Project[]>;
  updateProject(id: string, dto: UpdateProjectDTO): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;

  // Branch
  createBranch(dto: CreateBranchDTO): Promise<Branch>;
  getBranchById(id: string): Promise<Branch | null>;
  getBranchesByProject(
    projectId: string,
    includeDeleted?: boolean
  ): Promise<Branch[]>;
  updateBranchHead(id: string, headCommitSha: string): Promise<Branch | null>;
  updateBranch(id: string, dto: UpdateBranchDTO): Promise<Branch | null>;
  softDeleteBranch(id: string): Promise<boolean>;

  // Commit
  createCommit(dto: CreateCommitDTO): Promise<GitCommit>;
  getCommitsByProject(
    projectId: string,
    options?: { branchId?: string; limit?: number; offset?: number }
  ): Promise<GitCommit[]>;
  getCommitBySha(projectId: string, sha: string): Promise<any | null>;

  // Test Execution
  createTestExecution(dto: CreateTestExecutionDTO): Promise<TestExecution>;
  getTestExecutionsByProject(
    projectId: string,
    options?: { branchId?: string; commitSha?: string; source?: string; limit?: number }
  ): Promise<TestExecution[]>;
  getTestExecutionById(
    id: string
  ): Promise<{ execution: TestExecution; results: TestResult[] } | null>;

  // Graph and Analytics
  getTopologyGraph(projectId: string): Promise<TopologyGraphResponse>;
  getTestMetricsGraph(projectId: string): Promise<TestMetricsGraphResponse>;
  getTDDCyclesGraph(projectId: string, branchId?: string): Promise<TDDCyclePoint[]>;
}
