import { createHash, timingSafeEqual } from "node:crypto";
import { Request, Response } from "express";
import { SaveTDDEventsUseCase } from "../../modules/TDDCycles/Application/saveTDDEventsUseCase";
import { ITDDIngestionRepository, TDDEventConflictError } from "../../modules/TDDCycles/Domain/TDDEvents";
import { InvalidTDDEventsError, parseTDDEvents } from "../../modules/TDDCycles/Domain/parseTDDEvents";

interface IngestionAccess {
  enabled: boolean;
  token?: string;
  repository?: string;
}

export class TDDIngestionController {
  private readonly saveEvents: SaveTDDEventsUseCase;

  constructor(repository: ITDDIngestionRepository, private readonly access: IngestionAccess) {
    this.saveEvents = new SaveTDDEventsUseCase(repository);
  }

  async save(req: Request, res: Response) {
    if (!this.access.enabled || !this.access.token || !this.access.repository) {
      return res.status(503).json({ error: "TDD ingestion is not configured" });
    }
    const digest = (value: string) => createHash("sha256").update(value).digest();
    const authorization = req.get("Authorization") ?? "";
    if (!timingSafeEqual(digest(authorization), digest(`Bearer ${this.access.token}`))) {
      return res.status(401).json({ error: "Invalid ingestion token" });
    }
    try {
      const body: unknown = req.body;
      const batch = parseTDDEvents(body);
      if (`${batch.owner}/${batch.repoName}` !== this.access.repository.toLowerCase()) {
        return res.status(403).json({ error: "Repository is not authorized for this token" });
      }
      await this.saveEvents.execute(batch);
      return res.status(200).json({ executions: batch.executions.length, commits: batch.commits.length });
    } catch (error) {
      if (error instanceof InvalidTDDEventsError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof TDDEventConflictError) {
        return res.status(409).json({ error: error.message });
      }
      console.error("Error saving TDD events:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
}
