import { PracticeDataObject } from "../domain/PracticeInterface";
import PracticeRepositoryInterface from "../domain/PracticeRepositoryInterface";

export class CreatePractice {
  constructor(
    private readonly practiceRepository: PracticeRepositoryInterface
  ) {}

  async createPractice(practiceData: PracticeDataObject) {
    return await this.practiceRepository.createPractice(practiceData);
  }
}
