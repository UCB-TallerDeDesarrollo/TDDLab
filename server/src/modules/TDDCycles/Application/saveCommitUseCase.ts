import { IFirebaseDBBranchesCommitsRepository, CommitData } from "../Domain/IFirebaseDBBranchesCommitsRepository";

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
