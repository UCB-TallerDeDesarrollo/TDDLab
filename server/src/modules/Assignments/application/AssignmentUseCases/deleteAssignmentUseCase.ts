import AssignmentRepository from "../../repositories/AssignmentRepository";

class DeleteAssignment {
  private readonly adapter: AssignmentRepository;

  constructor(adapter: AssignmentRepository) {
    this.adapter = adapter;
  }

  async execute(assignmentId: string): Promise<void> {
    try {
      await this.adapter.deleteAssignment(assignmentId);
    } catch (error) {
      console.error("Ocurrió un error al eliminar la tarea");
      throw error;
    }
  }
}

export default DeleteAssignment;
