import { IBranchSupportRepository } from "../Repositories/IBranchSupportRepository";

export class SchemaSetupUseCase {
  constructor(private readonly repository: IBranchSupportRepository) {}

  async execute(): Promise<{ message: string }> {
    await this.repository.initSchema();
    return { message: "Branch support schema and tables initialized successfully." };
  }
}
