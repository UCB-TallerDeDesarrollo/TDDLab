import AssignmentRepository from "../../repositories/AssignmentRepository";
import { AssignmentDataObject } from "../../domain/Assignment";

class GetAssignments {
  private readonly adapter: AssignmentRepository;

  constructor(adapter: AssignmentRepository) {
    this.adapter = adapter;
  }

  async execute(): Promise<AssignmentDataObject[]> {
    try {
      const assignments = await this.adapter.obtainAssignments();
      return assignments;
    } catch (error) {
      console.error("Error");
      throw error;
    }
  }
}

export default GetAssignments;
