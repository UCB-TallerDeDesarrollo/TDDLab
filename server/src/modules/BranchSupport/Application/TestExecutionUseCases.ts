import { IBranchSupportRepository } from "../Repositories/IBranchSupportRepository";
import {
  TestExecution,
  TestResult,
  CreateTestExecutionDTO,
} from "../Domain/ITestExecution";

export class TestExecutionUseCases {
  constructor(private readonly repository: IBranchSupportRepository) {}

  async create(dto: CreateTestExecutionDTO): Promise<TestExecution> {
    if (!dto.project_id || dto.total_tests === undefined || !dto.conclusion) {
      throw new Error(
        "Missing required fields: project_id, total_tests, conclusion"
      );
    }
    return await this.repository.createTestExecution(dto);
  }

  async listByProject(
    projectId: string,
    options?: {
      branchId?: string;
      commitSha?: string;
      source?: string;
      limit?: number;
    }
  ): Promise<TestExecution[]> {
    if (!projectId) {
      throw new Error("Missing required field: projectId");
    }
    return await this.repository.getTestExecutionsByProject(projectId, options);
  }

  async getById(
    id: string
  ): Promise<{ execution: TestExecution; results: TestResult[] } | null> {
    if (!id) {
      throw new Error("Missing required field: id");
    }
    return await this.repository.getTestExecutionById(id);
  }
}
