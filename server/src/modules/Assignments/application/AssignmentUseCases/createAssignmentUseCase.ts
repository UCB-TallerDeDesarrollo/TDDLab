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
      const groupExists = await this.adapter.groupidExistsForAssigment(assignment.groupid);
      if (!groupExists) {
        throw new Error("Inexistent group ID");
      }
      const newAssignment = await this.adapter.createAssignment(assignment);
      return newAssignment;

    } catch (error) {
      throw error;
    }
  }
}

export default CreateAssignment;
