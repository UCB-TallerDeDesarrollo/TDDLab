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
    const MAX_TITLE_LENGTH = 50;
    if (updatedAssignment.title.length > MAX_TITLE_LENGTH) {
      throw new Error(
        `Limite de caracteres excedido. El titulo no puede tener mas de ${MAX_TITLE_LENGTH} caracteres.`
      );
    }
    try {
      const updatedAssignmentResult = await this.repository.updateAssignment(
        assignmentId,
        updatedAssignment
      );
      return updatedAssignmentResult;
    } catch (error) {
      console.error(`Error:`);
      throw error;
    }
  }
}

export default UpdateAssignment;
