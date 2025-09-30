import AssignmentsRepositoryInterface from "../domain/AssignmentsRepositoryInterface";

export class DeleteAssignment {
  constructor(
    private readonly assignmentsRepository: AssignmentsRepositoryInterface
  ) {}

  async deleteAssignment(assignmentId: number): Promise<string> {
    try {
      console.log('Deleting assignment with ID:', assignmentId);

      await this.assignmentsRepository.deleteAssignment(assignmentId);

      console.log('Assignment deleted successfully');
      return "Tarea eliminada correctamente";

    } catch (error: any) {
      console.error("Error deleting assignment:", error);
      
      throw new Error(error.message || "Error al eliminar la tarea");
    }
  }
}
