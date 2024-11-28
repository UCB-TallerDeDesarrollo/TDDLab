import PracticeRepository from "../../repository/PracticeRepository";
import { PracticeCreationObject } from "../../domain/Practice";

class UpdatePractice {
  private readonly adapter: PracticeRepository;
  constructor(adapter: PracticeRepository) {
    this.adapter = adapter;
  }
  async execute(
    assignmentId: string,
    updatedAssignment: PracticeCreationObject
  ): Promise<PracticeCreationObject | null> {
    try {
      const updatedAssignmentResult = await this.adapter.updatePractice(
        assignmentId,
        updatedAssignment
      );
      return updatedAssignmentResult;
    } catch (error) {
      console.error(`Error al actualizar la practica:`, error);
      throw error;
    }
  }
}

export default UpdatePractice;
