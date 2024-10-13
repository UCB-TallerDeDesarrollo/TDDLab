import { AssignmentDataObject } from "../domain/assignmentInterfaces";
import AssignmentsRepositoryInterface from "../domain/AssignmentsRepositoryInterface";

export class CreateAssignments {
  constructor(
    private readonly assignmentsRepository: AssignmentsRepositoryInterface
  ) {}

  async createAssignment(assignmentData: AssignmentDataObject) {
    return await this.assignmentsRepository.createAssignment(assignmentData);
  }
}
