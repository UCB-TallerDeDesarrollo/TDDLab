import { AssignmentDataObject } from "../../domain/Assignment";
import AssignmentRepository from "../../repositories/AssignmentRepository";

class GetAssignmentsByGroupidUseCase {
  private readonly adapter: AssignmentRepository;

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
      console.error("Error Obtaining assigments by groupid", error);
      throw error;
    }
  }
}

export default GetAssignmentsByGroupidUseCase;
