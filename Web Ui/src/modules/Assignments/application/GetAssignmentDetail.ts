import AssignmentsRepositoryInterface from "../domain/AssignmentsRepositoryInterface";
import { AssignmentDataObject } from "../domain/assignmentInterfaces";

export class GetAssignmentDetail {
  constructor(
    private readonly assignmentsRepository: AssignmentsRepositoryInterface
  ) {}

  async obtainAssignmentDetail(
    assignmentId: number
  ): Promise<AssignmentDataObject | null> {
    try {
      const assignment =
        await this.assignmentsRepository.getAssignmentById(assignmentId);
      if (assignment === null) {
        return null;
      }
      return assignment;
    } catch (error) {
      console.error("Error fetching assignment by ID:", error);
      throw error;
    }
  }
}
