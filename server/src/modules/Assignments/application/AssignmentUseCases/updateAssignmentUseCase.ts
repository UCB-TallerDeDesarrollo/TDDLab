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
      const currentAssignment = await this.repository.obtainAssignmentById(assignmentId);
      
      if (!currentAssignment) {
        throw new Error("Assignment not found");
      }
      if (currentAssignment.title !== updatedAssignment.title) {
        const isDuplicate = await this.repository.checkDuplicateTitle(
          updatedAssignment.title, 
          updatedAssignment.groupid
        );
        
        if (isDuplicate) {
          throw new Error("Ya existe una tarea con el mismo nombre en este grupo");
        }
      }
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