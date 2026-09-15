import { PracticeDataObject } from "../../domain/Practice";
import { IPracticeRepository } from "../../domain/IPracticeRepository";

class GetPracticesById {
  private readonly adapter: IPracticeRepository;
  constructor(adapter: IPracticeRepository) {
    this.adapter = adapter;
  }
  async execute(practiceId: string): Promise<PracticeDataObject | null> {
    try {
      const practice = await this.adapter.obtainPracticeById(practiceId);
      return practice;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
}

export default GetPracticesById;
