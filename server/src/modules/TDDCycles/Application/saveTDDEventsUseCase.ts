import { ITDDIngestionRepository, TDDEventBatch } from "../Domain/TDDEvents";

export class SaveTDDEventsUseCase {
  constructor(private readonly repository: ITDDIngestionRepository) {}

  execute(batch: TDDEventBatch) {
    return this.repository.saveEvents(batch);
  }
}
