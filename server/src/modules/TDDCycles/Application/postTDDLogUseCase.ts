import { IDBJobsRepository } from "../Domain/IDBJobsRepository";
import { ITimelineEntry } from "../Domain/ITimelineCommit";

export class PostTDDLogUseCase {
  private readonly dbJobRepository: IDBJobsRepository;

  constructor(dbJobRepository: IDBJobsRepository) {
    this.dbJobRepository = dbJobRepository;
  }
  
  async execute(timeline: ITimelineEntry[]) {
    try {
      await this.dbJobRepository.saveLogs(timeline);
    } catch (error) {
      console.error("Error al guardar los registros de timeline en la base de datos:", error);
      throw error;
    }
  }
}
