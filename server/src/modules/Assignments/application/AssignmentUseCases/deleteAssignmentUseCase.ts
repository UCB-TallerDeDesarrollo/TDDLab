import { IAssignmentRepository } from "../../domain/IAssignmentRepository";

class DeleteAssignment {
  private readonly adapter: IAssignmentRepository;

  constructor(adapter: IAssignmentRepository) {
    this.adapter = adapter;
  }

  async execute(assignmentId: string): Promise<void> {
    try {
      console.log('Eliminando assignment con ID:', assignmentId);

      if (!assignmentId || assignmentId.trim() === '') {
        throw new Error("ID de tarea invalido");
      }

      const existingAssingment = await this.adapter.obtainAssignmentById(assignmentId);
      if (!existingAssingment) {
        throw new Error("Tarea no encontrada");
      }

      await this.adapter.deleteAssignment(Number(assignmentId));

      console.log('Assignment eliminado exitosamente');

    } catch (error) {
      console.error("Error en DeleteAssignment UseCase:", error);
      throw error;
    }
  }
}

export default DeleteAssignment;
