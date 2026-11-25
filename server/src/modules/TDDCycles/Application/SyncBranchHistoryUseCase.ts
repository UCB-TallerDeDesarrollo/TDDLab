import type { ITDDHistoryRepository } from "../Domain/ITDDHistoryRepository";
import type { RepositoryKey, SaveSummary } from "../Domain/TDDHistory";
import { normalizeBranchSyncData } from "./normalizeBranchSyncData";

export class BranchSyncForbiddenError extends Error {
  constructor() {
    super("El token no tiene permisos para sincronizar este repositorio");
    this.name = "BranchSyncForbiddenError";
  }
}

export interface BranchSyncResult {
  readonly schemaVersion: 1;
  readonly mode: "incremental";
  readonly repository: RepositoryKey;
  readonly branch: string;
  readonly summary: SaveSummary;
  readonly headUpdate: {
    readonly status: "not_applied";
    readonly reason: "HEAD_UPDATES_NOT_SUPPORTED";
  };
}

/** A script may write only the repository granted by its server-side credential. */
export class SyncBranchHistoryUseCase {
  constructor(
    private readonly repository: Pick<ITDDHistoryRepository, "saveBatch">,
  ) {}

  async execute(
    input: unknown,
    authorizedRepository: RepositoryKey,
  ): Promise<BranchSyncResult> {
    const batch = normalizeBranchSyncData(input);
    if (
      batch.repository.provider !== authorizedRepository.provider ||
      batch.repository.owner !== authorizedRepository.owner ||
      batch.repository.name !== authorizedRepository.name
    ) {
      throw new BranchSyncForbiddenError();
    }
    const summary = await this.repository.saveBatch(batch);
    return {
      schemaVersion: 1,
      mode: "incremental",
      repository: batch.repository,
      branch: batch.branches[0].name,
      summary,
      // Explicitly acknowledge that this version stores history, not branch HEAD.
      headUpdate: {
        status: "not_applied",
        reason: "HEAD_UPDATES_NOT_SUPPORTED",
      },
    };
  }
}
