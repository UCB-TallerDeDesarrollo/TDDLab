import PracticeRepository from "../../repository/PracticeRepository";

class DeletePractice {
  private readonly adapter: PracticeRepository;
  constructor(adapter: PracticeRepository) {
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
