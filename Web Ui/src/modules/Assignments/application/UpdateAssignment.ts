import { AssignmentDataObject } from "../domain/assignmentInterfaces";
import AssignmentsRepositoryInterface from "../domain/AssignmentsRepositoryInterface";

export class UpdateAssignment {
  constructor(
    private readonly assignmentsRepository: AssignmentsRepositoryInterface
  ) {}

  async updateAssignment(
    assignmentId: number,
    assignmentData: AssignmentDataObject
  ) {
    try {
      // Ensure the assignment ID is included in the assignment data
      const updatedAssignmentData: AssignmentDataObject = {
        ...assignmentData,
        id: assignmentId,
      };

      // Call the updateAssignment method from the repository
      await this.assignmentsRepository.updateAssignment(
        assignmentId,
        updatedAssignmentData
      );
    } catch (error) {
      // Handle any errors that may occur during the update process
      console.error("Error updating assignment:", error);
      throw error;
    }
  }
}
