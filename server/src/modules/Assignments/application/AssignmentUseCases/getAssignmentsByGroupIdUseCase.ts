import { AssignmentDataObject } from "../../domain/Assignment";
import AssignmentRepository from "../../repositories/AssignmentRepository";

class GetAssignmentsByGroupIdUseCase {
    private adapter: AssignmentRepository;

    constructor(adapter: AssignmentRepository) {
      this.adapter = adapter;
    }
  
    async execute(groupId : number): Promise<AssignmentDataObject[]> {
      try {
        const assignments = await this.adapter.obtainAssignmentsByGroupId(groupId);
        return assignments;
      } catch (error) {
        console.error("Error fetching assignments:", error);
        throw error;
      }
    }
}

export default GetAssignmentsByGroupIdUseCase