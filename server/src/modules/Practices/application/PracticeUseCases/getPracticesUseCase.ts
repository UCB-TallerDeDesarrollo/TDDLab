import PracticeRepository from "../../repository/PracticeRepository";
import { PracticeDataObject } from "../../domain/Practice";

class GetPractices {
  private readonly adapter: PracticeRepository;
  constructor(adapter: PracticeRepository) {
    this.adapter = adapter;
  }
  async execute(): Promise<PracticeDataObject[]> {
    try {
      const practices = await this.adapter.obtainPractices();
      return practices;
    } catch (error) {
      console.error("Ocurrio un Error al obtener las Practicas:", error);
      throw error;
    }
  }
}

export default GetPractices;
