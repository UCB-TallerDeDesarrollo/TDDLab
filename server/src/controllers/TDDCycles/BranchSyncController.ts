import type { Request, Response } from "express";
import type { RepositoryKey } from "../../modules/TDDCycles/Domain/TDDHistory";
import {
  InvalidTDDHistoryBatchError,
  TDDHistoryConflictError,
} from "../../modules/TDDCycles/Domain/TDDHistory";
import {
  BranchSyncForbiddenError,
  SyncBranchHistoryUseCase,
} from "../../modules/TDDCycles/Application/SyncBranchHistoryUseCase";
import { BranchSyncConfigurationError } from "../../modules/TDDCycles/Infrastructure/BranchSyncCredentials";

export class BranchSyncController {
  constructor(private readonly useCase: SyncBranchHistoryUseCase) {}

  async sync(
    req: Request,
    res: Response,
    repository: RepositoryKey,
  ): Promise<void> {
    try {
      res.status(200).json(await this.useCase.execute(req.body, repository));
    } catch (error) {
      if (error instanceof InvalidTDDHistoryBatchError) {
        res
          .status(400)
          .json({ code: "INVALID_SYNC_BATCH", message: error.message });
      } else if (error instanceof BranchSyncForbiddenError) {
        res
          .status(403)
          .json({ code: "REPOSITORY_FORBIDDEN", message: error.message });
      } else if (error instanceof TDDHistoryConflictError) {
        res
          .status(409)
          .json({ code: "HISTORY_CONFLICT", message: error.message });
      } else if (error instanceof BranchSyncConfigurationError) {
        res
          .status(503)
          .json({ code: "SYNC_UNAVAILABLE", message: error.message });
      } else {
        res
          .status(500)
          .json({
            code: "SYNC_FAILED",
            message: "No se pudo sincronizar el historial TDD",
          });
      }
    }
  }
}
