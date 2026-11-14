import type {
  BranchRecord,
  CommitRecord,
  ExecutionFilter,
  RepositoryKey,
  SaveSummary,
  TDDHistoryBatch,
  TestExecutionRecord,
} from "./TDDHistory";

/**
 * Puerto de persistencia: las implementaciones no reciben BranchSyncData.
 * Los datos inválidos y los conflictos no dejan escrituras parciales.
 * Las lecturas devuelven copias; un repositorio ausente devuelve null o [].
 *
 * Las ramas se registran sin actualizar HEAD. No hay política de concurrencia
 * ni descubrimiento de relaciones Git en esta etapa.
 */
export interface ITDDHistoryRepository {
  saveBatch(batch: TDDHistoryBatch): Promise<SaveSummary>;
  findRepository(repository: RepositoryKey): Promise<RepositoryKey | null>;
  listBranches(repository: RepositoryKey): Promise<BranchRecord[]>;
  findCommit(
    repository: RepositoryKey,
    sha: string,
  ): Promise<CommitRecord | null>;

  /** Orden cronológico ascendente (desconocidos al final), desempate por SHA.
   * No declara un orden topológico ni convierte el historial en una línea.
   */
  listBranchCommits(
    repository: RepositoryKey,
    branchName: string,
  ): Promise<CommitRecord[]>;

  /** Orden ascendente por timestamp y eventId; sin filtro devuelve todas. */
  listExecutions(
    repository: RepositoryKey,
    filter?: ExecutionFilter,
  ): Promise<TestExecutionRecord[]>;
}
