import { AssignmentDataObject } from "../../domain/Assignment";
import { IAssignmentRepository } from "../../domain/IAssignmentRepository";

class GetAssignmentById {
  private readonly adapter: IAssignmentRepository;

  constructor(adapter: IAssignmentRepository) {
    this.adapter = adapter;
  }

  async execute(assignmentId: string): Promise<AssignmentDataObject | null> {
    try {
      const assignment = await this.adapter.obtainAssignmentById(assignmentId);
      return assignment;
    } catch (error) {
      console.error(`Error fetching assignment`);
      throw error;
    }
  }
}

export default GetAssignmentById;
