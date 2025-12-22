import { IFirebaseDBBranchesCommitsRepository } from "../Domain/IFirebaseDBBranchesCommitsRepository";
import { TestRunsData } from "../Domain/TestRunsData";

export class SaveTestRunsUseCase {
  private repository: IFirebaseDBBranchesCommitsRepository;

  constructor(repository: IFirebaseDBBranchesCommitsRepository) {
    this.repository = repository;
  }

  async execute(testRunsData: TestRunsData): Promise<void> {
    try {
      await this.repository.saveTestRuns(testRunsData);
    } catch (error) {
      console.error("Error in SaveTestRunsUseCase:", error);
      throw new Error("Failed to save test runs data.");
    }
  }
}
