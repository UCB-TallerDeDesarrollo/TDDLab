/**
 * Modelos de almacenamiento del historial TDD.
 * No dependen del DTO HTTP, de un proveedor remoto ni de PostgreSQL.
 * La normalización de identidades externas corresponde a la entrada.
 */
export interface RepositoryKey {
  // Identidad exacta: la normalización específica del proveedor va en la entrada.
  readonly provider: string;
  readonly owner: string;
  readonly name: string;
}

export interface BranchInput {
  readonly name: string;
}

/** No incluye HEAD ni versiones: su concurrencia sigue pendiente. */
export interface BranchRecord extends BranchInput {
  readonly repository: RepositoryKey;
}

export interface CommitStats {
  readonly additions: number;
  readonly deletions: number;
  readonly total: number;
}

export interface CommitMetrics {
  readonly executionEventId: string | null;
  readonly numPassedTests: number | null;
  readonly failedTests: number | null;
  readonly numTotalTests: number | null;
  readonly coveragePercentage: number | null;
  readonly conclusion: "success" | "failure" | "neutral" | null;
}

export interface CommitRecord {
  readonly sha: string;
  readonly parentShas: readonly string[] | null;
  readonly message: string;
  readonly committedAt: string | null;
  readonly stats: CommitStats | null;
  readonly metrics: CommitMetrics | null;
}

export interface BranchCommitRelation {
  readonly branchName: string;
  readonly commitSha: string;
}

export interface TestExecutionRecord {
  // Identificador opaco estable. Validar UUID del DTO corresponde a su receptor.
  readonly eventId: string;
  // La captura original no se completa ni se reescribe a partir de otro lote.
  readonly branchAtCapture: string | null;
  readonly headShaAtExecution: string | null;
  // La asociación sí permite completar null con un SHA conocido del repositorio.
  readonly associatedCommitSha: string | null;
  readonly timestamp: number;
  readonly numPassedTests: number;
  readonly failedTests: number;
  readonly numTotalTests: number;
  readonly coveragePercentage: number | null;
  readonly success: boolean;
  readonly testId: number | null;
}

/** Un lote incremental normalizado, limitado a un repositorio. */
export interface TDDHistoryBatch {
  readonly repository: RepositoryKey;
  readonly branches: readonly BranchInput[];
  readonly commits: readonly CommitRecord[];
  readonly branchCommits: readonly BranchCommitRelation[];
  readonly executions: readonly TestExecutionRecord[];
}

export interface SaveSummary {
  readonly repositoryCreated: boolean;
  readonly branchesAdded: number;
  readonly commitsAdded: number;
  readonly commitsUpdated: number;
  readonly relationsAdded: number;
  readonly executionsAdded: number;
  readonly executionsUpdated: number;
}

/** Distingue explícitamente origen de captura y pertenencia al historial. */
export type ExecutionFilter =
  | { readonly kind: "all" }
  | { readonly kind: "captured-in-branch"; readonly branchName: string }
  | { readonly kind: "in-branch-history"; readonly branchName: string }
  | { readonly kind: "associated-with-commit"; readonly sha: string };

export class InvalidTDDHistoryBatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTDDHistoryBatchError";
  }
}

export class TDDHistoryConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TDDHistoryConflictError";
  }
}
