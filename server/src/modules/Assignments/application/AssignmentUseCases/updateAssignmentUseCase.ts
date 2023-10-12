import AssignmentRepository from "../../repositories/AssignmentRepository";
import { AssignmentDataObject } from "../../domain/Assignment";
class UpdateAssignment {
  private repository: AssignmentRepository;

  constructor(repository: AssignmentRepository) {
    this.repository = repository;
  }

  async execute(
    assignmentId: number,
    updatedAssignment: AssignmentDataObject
  ): Promise<AssignmentDataObject | null> {
    try {
      const updatedAssignmentResult = await this.repository.updateAssignment(
        assignmentId,
        updatedAssignment
      );
      return updatedAssignmentResult;
    } catch (error) {
      console.error("Error updating assignments:", error);

      throw error;
    }
  }
}

export default UpdateAssignment;
