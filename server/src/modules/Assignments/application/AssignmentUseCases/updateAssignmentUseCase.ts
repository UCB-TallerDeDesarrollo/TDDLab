import AssignmentRepository from "../../repositories/AssignmentRepository";
import { AssignmentCreationObject } from "../../domain/Assignment";
class UpdateAssignment {
  private readonly repository: AssignmentRepository;

  constructor(repository: AssignmentRepository) {
    this.repository = repository;
  }

  async execute(
    assignmentId: string,
    updatedAssignment: AssignmentCreationObject
  ): Promise<AssignmentCreationObject | null> {
    try {
      const updatedAssignmentResult = await this.repository.updateAssignment(
        assignmentId,
        updatedAssignment
      );
      return updatedAssignmentResult;
    } catch (error) {
      throw error;
    }
  }
}

export default UpdateAssignment;
