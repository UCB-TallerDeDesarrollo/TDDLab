import { PracticeDataObject } from "../../domain/Practice";
import { IPracticeRepository } from "../../domain/IPracticeRepository";

class GetPracticesByUserId {
  private readonly adapter: IPracticeRepository;
  constructor(adapter: IPracticeRepository) {
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
