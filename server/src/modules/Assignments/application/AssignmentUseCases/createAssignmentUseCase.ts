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
      console.log("*******Assignment: ", assignment);
      const newAssignment = await this.adapter.createAssignment(assignment);
      console.log("*******New Assignment: ", newAssignment);
      return newAssignment;
    } catch (error) {
      //console.error("Error creating assignment:", error);
      throw error;
    }
  }
}

export default CreateAssignment;
