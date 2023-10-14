import  AssignmentsRepositoryInterface  from "../domain/AssignmentsRepositoryInterface";

export class DeleteAssignment {
  constructor(private assignmentsRepository: AssignmentsRepositoryInterface) {}

  async deleteAssignment(assignmentId: number) {
    try {
      const assignment = await this.assignmentsRepository.deleteAssignment(assignmentId);

      if (assignment === null) {
        return null;
      }

      return 'Succesful deletion';
    } catch (error) {
      console.error('Error deleting assignment by ID:', error);
      throw error;
    }
  }
}
