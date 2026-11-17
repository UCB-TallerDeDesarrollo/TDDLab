import { IBranchSupportRepository } from "../Repositories/IBranchSupportRepository";
import { GitCommit, CreateCommitDTO } from "../Domain/IGitCommit";

export class CommitUseCases {
  constructor(private readonly repository: IBranchSupportRepository) {}

  async create(dto: CreateCommitDTO): Promise<GitCommit> {
    if (!dto.project_id || !dto.sha || !dto.author || !dto.message || !dto.committed_at) {
      throw new Error(
        "Missing required fields: project_id, sha, author, message, committed_at"
      );
    }
    return await this.repository.createCommit(dto);
  }

  async listByProject(
    projectId: string,
    options?: { branchId?: string; limit?: number; offset?: number }
  ): Promise<GitCommit[]> {
    if (!projectId) {
      throw new Error("Missing required field: projectId");
    }
    return await this.repository.getCommitsByProject(projectId, options);
  }

  async getBySha(projectId: string, sha: string): Promise<any | null> {
    if (!projectId || !sha) {
      throw new Error("Missing required fields: projectId, sha");
    }
    return await this.repository.getCommitBySha(projectId, sha);
  }
}
