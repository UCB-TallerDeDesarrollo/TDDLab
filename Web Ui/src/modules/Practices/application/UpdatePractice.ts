import { PracticeDataObject } from "../domain/PracticeInterface";
import PracticeRepositoryInterface from "../domain/PracticeRepositoryInterface";

export class UpdatePractice {
  constructor(
    private readonly practicesRepositor: PracticeRepositoryInterface
  ) {}

  async updatePractice(practiceId: number, practiceData: PracticeDataObject) {
    try {
      const updatedPracticeData: PracticeDataObject = {
        ...practiceData,
        id: practiceId,
      };

      await this.practicesRepositor.updatePractice(
        practiceId,
        updatedPracticeData
      );
    } catch (error) {
      console.error("Error updating pracice:", error);
      throw error;
    }
  }
}
