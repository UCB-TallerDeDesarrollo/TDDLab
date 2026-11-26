import { IBranchSupportRepository } from "../Repositories/IBranchSupportRepository";
import { Branch, CreateBranchDTO, UpdateBranchDTO } from "../Domain/IBranch";

export class BranchUseCases {
  constructor(private readonly repository: IBranchSupportRepository) {}

  async create(dto: CreateBranchDTO): Promise<Branch> {
    if (!dto.project_id || !dto.name) {
      throw new Error("Missing required fields: project_id, name");
    }
    return await this.repository.createBranch(dto);
  }

  async getById(id: string): Promise<Branch | null> {
    return await this.repository.getBranchById(id);
  }

  async listByProject(
    projectId: string,
    includeDeleted: boolean = false
  ): Promise<Branch[]> {
    if (!projectId) {
      throw new Error("Missing required field: projectId");
    }
    return await this.repository.getBranchesByProject(projectId, includeDeleted);
  }

  async updateHead(id: string, headCommitSha: string): Promise<Branch | null> {
    if (!headCommitSha) {
      throw new Error("Missing required field: headCommitSha");
    }
    return await this.repository.updateBranchHead(id, headCommitSha);
  }

  async update(id: string, dto: UpdateBranchDTO): Promise<Branch | null> {
    return await this.repository.updateBranch(id, dto);
  }

  async softDelete(id: string): Promise<boolean> {
    return await this.repository.softDeleteBranch(id);
  }
}
