import { PracticeCreationObject } from "../../domain/Practice";
import { IPracticeRepository } from "../../domain/IPracticeRepository";

class UpdatePractice {
  private readonly adapter: IPracticeRepository;
  constructor(adapter: IPracticeRepository) {
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
