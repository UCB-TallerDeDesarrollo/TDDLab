import PracticeRepository from "../../repository/PracticeRepository";
import { PracticeDataObject } from "../../domain/Practice";

class GetPracticesByUserId {
  private readonly adapter: PracticeRepository;
  constructor(adapter: PracticeRepository) {
    this.adapter = adapter;
  }
  async execute(userid: string): Promise<PracticeDataObject[]> {
    try {
      const practices = await this.adapter.obtainPracticesByUserId(userid);
      return practices;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
}

export default GetPracticesByUserId;
