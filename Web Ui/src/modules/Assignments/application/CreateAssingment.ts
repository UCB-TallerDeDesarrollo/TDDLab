import { AssignmentDataObject } from "../domain/assignmentInterfaces";
import AssignmentsRepositoryInterface from "../domain/AssignmentsRepositoryInterface";

export class CreateAssignments {
  constructor(
    private readonly assignmentsRepository: AssignmentsRepositoryInterface
  ) {}

  async createAssignment(assignmentData: AssignmentDataObject) {
    try {
      return await this.assignmentsRepository.createAssignment(assignmentData);
    } catch (error) {
      console.error("Error al crear la tarea:", error);
      throw error; 
      
    }
  }
  
}
