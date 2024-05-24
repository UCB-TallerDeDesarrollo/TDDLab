import AssignmentRepository from "../../repositories/AssignmentRepository";

class DeleteAssignment {
  private adapter: AssignmentRepository;

  constructor(adapter: AssignmentRepository) {
    this.adapter = adapter;
  }

  async execute(assignmentId: string): Promise<void> {
    try {
      await this.adapter.deleteAssignment(assignmentId);
    } catch (error) {
      console.error("Ocurrió un error al eliminar la tarea:", error);
      throw error;
    }
  }
}

export default DeleteAssignment;
