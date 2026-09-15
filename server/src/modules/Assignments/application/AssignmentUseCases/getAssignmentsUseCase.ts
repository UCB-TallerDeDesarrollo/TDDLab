import { AssignmentDataObject } from "../../domain/Assignment";
import { IAssignmentRepository } from "../../domain/IAssignmentRepository";

class GetAssignments {
  private readonly adapter: IAssignmentRepository;

  constructor(adapter: IAssignmentRepository) {
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
