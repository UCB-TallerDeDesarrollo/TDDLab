import AssignmentRepository from "../../repositories/AssignmentRepository";
import { AssignmentDataObject } from "../../domain/Assignment";

class GetAssignments {
  private adapter: AssignmentRepository;

  constructor(adapter: AssignmentRepository) {
    this.adapter = adapter;
  }

  async execute(): Promise<AssignmentDataObject[]> {
    try {
      const assignments = await this.adapter.obtainAssignments();
      return assignments;
    } catch (error) {
      console.error("Error fetching assignments:", error);
      throw error;
    }
  }
}

export default GetAssignments;
