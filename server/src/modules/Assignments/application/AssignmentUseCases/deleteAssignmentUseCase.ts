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

      throw error;
    }
  }
}

export default DeleteAssignment;
