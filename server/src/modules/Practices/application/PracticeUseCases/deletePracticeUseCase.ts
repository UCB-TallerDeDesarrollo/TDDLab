import { IPracticeRepository } from "../../domain/IPracticeRepository";

class DeletePractice {
  private readonly adapter: IPracticeRepository;
  constructor(adapter: IPracticeRepository) {
    this.adapter = adapter;
  }
  async execute(practiceId: string): Promise<void> {
    try {
      await this.adapter.deletePractice(practiceId);
    } catch (error) {
      console.error("Ocurrio un Error al eliminar la Tarea:", error);
      throw error;
    }
  }
}

export default DeletePractice;
