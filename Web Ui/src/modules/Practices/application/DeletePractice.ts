import PracticeRepositoryInterface from "../domain/PracticeRepositoryInterface";

export class DeletePractice {
  constructor(
    private readonly practicesRepository: PracticeRepositoryInterface
  ) {}
  async DeletePractice(practiceId: number) {
    try {
      await this.practicesRepository.deletePractice(practiceId);
      return "Succesful deletion";
    } catch (error) {
      console.error("Error deleting practice by ID:", error);
      throw error;
    }
  }
}
