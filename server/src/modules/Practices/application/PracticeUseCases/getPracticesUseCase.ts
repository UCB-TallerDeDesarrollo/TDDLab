import { PracticeDataObject } from "../../domain/Practice";
import { IPracticeRepository } from "../../domain/IPracticeRepository";

class GetPractices {
  private readonly adapter: IPracticeRepository;
  constructor(adapter: IPracticeRepository) {
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
