import { AssignmentDataObject } from "../../domain/Assignment";
import AssignmentRepository from "../../repositories/AssignmentRepository";

class GetAssignmentsByGroupidUseCase {
  private adapter: AssignmentRepository;

  constructor(adapter: AssignmentRepository) {
    this.adapter = adapter;
  }

  async execute(groupid: number): Promise<AssignmentDataObject[]> {
    try {
      const assignments = await this.adapter.obtainAssignmentsByGroupId(
        groupid
      );
      return assignments;
    } catch (error) {
      //console.error("Error fetching assignments:", error);
      throw error;
    }
  }
}

export default GetAssignmentsByGroupidUseCase;
