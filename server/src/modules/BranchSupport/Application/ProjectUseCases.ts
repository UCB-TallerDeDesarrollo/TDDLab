import { IBranchSupportRepository } from "../Repositories/IBranchSupportRepository";
import { Project, CreateProjectDTO, UpdateProjectDTO } from "../Domain/IProject";

export class ProjectUseCases {
  constructor(private readonly repository: IBranchSupportRepository) {}

  async create(dto: CreateProjectDTO): Promise<Project> {
    if (!dto.name || !dto.link || !dto.github_user) {
      throw new Error("Missing required fields: name, link, github_user");
    }
    return await this.repository.createProject(dto);
  }

  async getById(id: string): Promise<Project | null> {
    return await this.repository.getProjectById(id);
  }

  async listByUser(githubUser?: string): Promise<Project[]> {
    return await this.repository.getProjectsByUser(githubUser);
  }

  async update(id: string, dto: UpdateProjectDTO): Promise<Project | null> {
    return await this.repository.updateProject(id, dto);
  }

  async delete(id: string): Promise<boolean> {
    return await this.repository.deleteProject(id);
  }
}
