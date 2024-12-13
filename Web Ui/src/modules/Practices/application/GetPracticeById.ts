import PracticeRepositoryInterface from "../domain/PracticeRepositoryInterface";
import { PracticeDataObject } from "../domain/PracticeInterface";

export class GetPracticeById {
  constructor(
    private readonly practiceRepository: PracticeRepositoryInterface
  ) {}

  async obtainAssignmentDetail(
    practiceId: number
  ): Promise<PracticeDataObject | null> {
    try {
      const assignment =
        await this.practiceRepository.getPracticeById(practiceId);
      if (assignment === null) {
        return null;
      }
      return assignment;
    } catch (error) {
      console.error("Error fetching practice by ID:", error);
      throw error;
    }
  }
}
