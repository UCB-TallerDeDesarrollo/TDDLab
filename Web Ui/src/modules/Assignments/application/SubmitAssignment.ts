import { AssignmentDataObject } from "../domain/assignmentInterfaces";
import AssignmentsRepositoryInterface from "../domain/AssignmentsRepositoryInterface";

export class SubmitAssignment {
  constructor(private assignmentsRepository: AssignmentsRepositoryInterface) {}

  async submitAssignment(
    assignmentId: number,
    link: string,
    comment: string
  ): Promise<AssignmentDataObject | null> {
    try {
      const foundAssignment: AssignmentDataObject | null =
        await this.assignmentsRepository.getAssignmentById(assignmentId);

      if (foundAssignment !== null) {
        foundAssignment.link = link;

        if (foundAssignment.state == "pending") {
          foundAssignment.state = "in progress";
        } else {
          foundAssignment.state = "delivered";
          foundAssignment.comment = comment;
        }

        await this.assignmentsRepository.updateAssignment(
          assignmentId,
          foundAssignment
        );

        return foundAssignment; // Return the updated assignment
      } else {
        throw new Error("No se encontró la tarea");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
