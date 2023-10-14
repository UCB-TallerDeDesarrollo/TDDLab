import { AssignmentDataObject } from "../domain/assignmentInterfaces";
import  AssignmentsRepositoryInterface  from "../domain/AssignmentsRepositoryInterface";

export class SendAssignment {
  constructor(private assignmentsRepository: AssignmentsRepositoryInterface) {}

  async sendAssignment(assignmentId: number) {
    try {
      const foundAssignment: AssignmentDataObject | null = await this.assignmentsRepository.fetchAssignmentById(assignmentId);

      if (foundAssignment !== null) {
        foundAssignment.state = 'delivered';
        return await this.assignmentsRepository.updateAssignment(assignmentId, foundAssignment);
        
      } else {
        throw new Error("No se encontró la tarea");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
