import { IFirebaseDBBranchesCommitsRepository } from "../Domain/IFirebaseDBBranchesCommitsRepository";
import { CommitData } from "../Domain/CommitData";

export class SaveCommitUseCase {
  private repository: IFirebaseDBBranchesCommitsRepository;

  constructor(repository: IFirebaseDBBranchesCommitsRepository) {
    this.repository = repository;
  }

  async execute(commitData: CommitData): Promise<void> {
    try {
      await this.repository.saveCommit(commitData);
    } catch (error) {
      console.error("Error in SaveCommitUseCase:", error);
      throw new Error("Failed to save commit data.");
    }
  }
}
