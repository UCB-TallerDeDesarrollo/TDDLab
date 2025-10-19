import AssignmentsRepositoryInterface from "../domain/AssignmentsRepositoryInterface";

export class DeleteAssignment {
  constructor(
    private readonly assignmentsRepository: AssignmentsRepositoryInterface
  ) {}

  async deleteAssignment(assignmentId: number) {
    try {
      await this.assignmentsRepository.deleteAssignment(assignmentId);
      return "Succesful deletion";
    } catch (error) {
      console.error("Error deleting assignment by ID:", error);
      throw error;
    }
  }
}
