// Similar a createAssignmentUseCase.ts
import { PracticeCreationObject } from "../../domain/Practice";
import PracticeRepository from "../../repository/PracticeRepository";

class CreatePractice {
  private readonly adapter: PracticeRepository;
  constructor(adapter: PracticeRepository) {
    this.adapter = adapter;
  }

  async execute(
    practice: Omit<PracticeCreationObject, "id">
  ): Promise<PracticeCreationObject> {
    try {
      const newPractice = await this.adapter.createPractice(practice);
      return newPractice;
    } catch (error) {
      console.error("Ocurrió un error al crear la práctica:", error);
      throw error;
    }
  }
}

export default CreatePractice;
