import { AssignmentDataObject } from "../../domain/Assignment";
import { IAssignmentRepository } from "../../domain/IAssignmentRepository";

class GetAssignmentsByGroupidUseCase {
  private readonly adapter: IAssignmentRepository;

  constructor(adapter: IAssignmentRepository) {
    this.adapter = adapter;
  }

  async execute(groupid: number): Promise<AssignmentDataObject[]> {
    try {
      const assignments = await this.adapter.obtainAssignmentsByGroupId(
        groupid
      );
      return assignments;
    } catch (error) {
      console.error("Error Obtaining assigments by groupid");
      throw error;
    }
  }
}

export default GetAssignmentsByGroupidUseCase;
