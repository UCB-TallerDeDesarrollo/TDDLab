import { PracticeCreationObject } from "../../domain/Practice";
import { IPracticeRepository } from "../../domain/IPracticeRepository";

class CreatePractice {
  private readonly adapter: IPracticeRepository;
  constructor(adapter: IPracticeRepository) {
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
