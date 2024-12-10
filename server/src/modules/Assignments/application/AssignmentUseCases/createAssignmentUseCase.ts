import { AssignmentCreationObject } from "../../domain/Assignment";
import AssignmentRepository from "../../repositories/AssignmentRepository";

class CreateAssignment {
  private readonly adapter: AssignmentRepository;

  constructor(adapter: AssignmentRepository) {
    this.adapter = adapter;
  }

  async execute(
    assignment: Omit<AssignmentCreationObject, "id">
  ): Promise<AssignmentCreationObject> {
    try {
      const groupExists = await this.adapter.groupidExistsForAssigment(
        assignment.groupid
      );
      if (!groupExists) {
        throw new Error("Inexistent group ID");
      }
      const titleExists = await this.adapter.checkDuplicateTitle(
        assignment.title,
        assignment.groupid
      );
      if (titleExists) {
        throw new Error("Ya existe una tarea con el mismo nombre en este grupo");
      }
  
      const newAssignment = await this.adapter.createAssignment(assignment);
      return newAssignment;
    } catch (error) {
      console.error("Ocurrió un error al crear la tarea:", error);
      throw error;
    }
  }
}

export default CreateAssignment;