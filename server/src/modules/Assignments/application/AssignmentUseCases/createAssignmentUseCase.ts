import { AssignmentCreationObject } from "../../domain/Assignment";
import AssignmentRepository from "../../repositories/AssignmentRepository";

class CreateAssignment {
  private adapter: AssignmentRepository;

  constructor(adapter: AssignmentRepository) {
    this.adapter = adapter;
  }

  async execute(
    assignment: Omit<AssignmentCreationObject, "id">
  ): Promise<AssignmentCreationObject> {
    try {
      const newAssignment = await this.adapter.createAssignment(assignment);
      return newAssignment;
    } catch (error) {
      //console.error("Error creating assignment:", error);
      throw error;
    }
  }
}

export default CreateAssignment;
