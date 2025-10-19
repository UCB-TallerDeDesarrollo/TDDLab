import PracticeRepository from "../../repository/PracticeRepository";
import { PracticeDataObject } from "../../domain/Practice";

class GetPracticesById {
  private readonly adapter: PracticeRepository;
  constructor(adapter: PracticeRepository) {
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
