/**
 * Contrato JSON de sincronización TDD, versión 1.
 *
 * Cada lote describe un repositorio GitHub y una rama consultada.
 * La sincronización es incremental: omitir datos nunca significa eliminarlos.
 *
 * Reglas para el futuro receptor (este archivo no implementa validación):
 * - Validar el lote completo antes de persistir. Los datos inválidos se
 *   rechazan atómicamente, sin guardar una parte del lote.
 * - Un conflicto al actualizar el HEAD es una condición diferenciada de
 *   los datos inválidos. La política de aceptación de los demás datos y
 *   la respuesta correspondiente deben acordarse con el equipo de API.
 * - Los eventos se identifican por repositorio y eventId; los commits por
 *   repositorio y SHA; las relaciones por repositorio, rama y SHA.
 * - Reenviar datos no crea duplicados. Un null no borra información conocida.
 * - Una colisión con datos conocidos incompatibles no se sobrescribe
 *   silenciosamente. Las asociaciones pendientes pueden completarse.
 * - No deducir la rama de captura de la rama consultada ni del orden del lote.
 *
 * Solo contiene tipos serializables. TypeScript no valida entradas externas
 * en tiempo de ejecución. No requiere PostgreSQL, acceso a red ni Jest.
 */

export type GitSha = string;

export interface BranchSyncRepository {
  readonly provider: "github";
  readonly owner: string;
  readonly name: string;
}

export interface BranchSyncBranch {
  readonly name: string;

  /**
   * HEAD observado de la rama consultada.
   * null significa desconocido, no una orden para borrar el HEAD guardado.
   */
  readonly headSha: GitSha | null;

  /**
   * Mecanismo candidato de concurrencia, pendiente de acuerdo con la API.
   * 0 representa ausencia de un HEAD confirmado por el backend.
   * null significa que no se solicita actualizar el HEAD.
   *
   * Los scripts deben capturar eventos sin conexión y sin conocer esta
   * versión. No consultan PostgreSQL: si una futura API proporciona una
   * versión, se utilizará al sincronizar, no al ejecutar las pruebas.
   *
   * No es un contador Git ni prueba de ascendencia. Este contrato no
   * implementa actualizaciones del HEAD ni resuelve conflictos.
   */
  readonly expectedHeadVersion: number | null;
}

export interface BranchSyncCommitStats {
  readonly additions: number;
  readonly deletions: number;
  readonly total: number;
}

export interface BranchSyncCommitMetrics {
  /** Ejecución de origen, si se conoce; null permite métricas heredadas. */
  readonly executionEventId: string | null;

  readonly numPassedTests: number | null;
  readonly failedTests: number | null;
  readonly numTotalTests: number | null;
  readonly coveragePercentage: number | null;
  readonly conclusion: "success" | "failure" | "neutral" | null;
}

export interface BranchSyncCommit {
  /** SHA real y completo. No utilizar el marcador mutable "HEAD". */
  readonly sha: GitSha;

  /** [] significa raíz confirmada; null significa padres desconocidos. */
  readonly parentShas: readonly GitSha[] | null;

  readonly message: string;

  /** Fecha ISO 8601 en UTC, o null si no se conoce. */
  readonly committedAt: string | null;

  /** null representa información desconocida; cero es un valor conocido. */
  readonly stats: BranchSyncCommitStats | null;
  readonly metrics: BranchSyncCommitMetrics | null;
}

export interface BranchSyncExecution {
  /**
   * UUID creado una sola vez durante la captura y persistido localmente.
   * Se conserva al reintentar la sincronización y después de los merges.
   */
  readonly eventId: string;

  /** Rama original; null si es desconocida o no hay una rama nombrada. */
  readonly branchAtCapture: string | null;

  /** HEAD al ejecutar; puede ser null antes del primer commit. */
  readonly headShaAtExecution: GitSha | null;

  /**
   * Commit asociado posteriormente, o null mientras no se conozca.
   * Completarlo no cambia el eventId ni el contexto original de captura.
   */
  readonly associatedCommitSha: GitSha | null;

  /** Milisegundos desde la época Unix; no segundos ni un objeto Date. */
  readonly timestamp: number;

  readonly numPassedTests: number;
  readonly failedTests: number;
  readonly numTotalTests: number;
  readonly coveragePercentage: number | null;
  readonly success: boolean;

  /** Agrupamiento heredado opcional en significado, nunca identidad única. */
  readonly testId: number | null;
}

export interface BranchSyncData {
  readonly schemaVersion: 1;
  readonly mode: "incremental";

  readonly repository: BranchSyncRepository;
  readonly branch: BranchSyncBranch;

  /** Catálogo de commits enviados; no implica pertenencia a la rama. */
  readonly commits: readonly BranchSyncCommit[];

  /**
   * Relaciones que deben existir para la rama consultada.
   * Cada SHA debe venir en commits o estar almacenado previamente.
   * El orden no declara una secuencia lineal y no elimina otras relaciones.
   */
  readonly branchCommitShas: readonly GitSha[];

  /** Los eventos heredados de otras ramas conservan su captura original. */
  readonly executions: readonly BranchSyncExecution[];
}
