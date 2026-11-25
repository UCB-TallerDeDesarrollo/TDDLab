import { isDeepStrictEqual } from "node:util";
import {
  InvalidTDDHistoryBatchError,
  TDDHistoryConflictError,
} from "./TDDHistory";
import type {
  CommitRecord,
  TDDHistoryBatch,
  TestExecutionRecord,
} from "./TDDHistory";

/**
 * Completa valores desconocidos sin borrar datos ni aceptar reemplazos
 * incompatibles. Las colecciones conocidas (como padres) se comparan enteras.
 */
function mergeKnown<T>(previous: T, incoming: T, field: string): T {
  if (incoming === null || isDeepStrictEqual(previous, incoming))
    return structuredClone(previous);
  if (previous === null) return structuredClone(incoming);
  if (
    typeof previous === "object" &&
    typeof incoming === "object" &&
    !Array.isArray(previous) &&
    !Array.isArray(incoming)
  ) {
    const left = previous as Record<string, unknown>;
    const right = incoming as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(left).map((key) => [
        key,
        mergeKnown(left[key], right[key], field + "." + key),
      ]),
    ) as T;
  }
  throw new TDDHistoryConflictError("Dato incompatible: " + field);
}

export function valid(condition: unknown, message: string): asserts condition {
  if (!condition) throw new InvalidTDDHistoryBatchError(message);
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, field: string): void {
  valid(
    typeof value === "string" &&
      value.trim().length > 0 &&
      value === value.trim(),
    field + " debe ser un texto normalizado no vacío",
  );
}

function sha(value: unknown): void {
  valid(
    typeof value === "string" && /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(value),
    "Se requiere un SHA Git completo, no HEAD ni un identificador abreviado",
  );
}

function count(value: unknown): void {
  valid(
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0,
    "Las cantidades deben ser enteros seguros no negativos",
  );
}

function coverage(value: unknown): void {
  valid(
    value === null ||
      (typeof value === "number" &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 100),
    "La cobertura debe ser null o un número entre 0 y 100",
  );
}

function results(
  passed: number | null,
  failed: number | null,
  total: number | null,
): void {
  for (const value of [passed, failed, total]) if (value !== null) count(value);
  if (total !== null) {
    valid(
      (passed ?? 0) + (failed ?? 0) <= total,
      "Las pruebas exitosas y fallidas no pueden superar el total",
    );
  }
}

function validateCommit(commit: CommitRecord): void {
  valid(object(commit), "Commit inválido");
  sha(commit.sha);
  valid(typeof commit.message === "string", "Mensaje de commit inválido");
  if (commit.parentShas !== null) {
    valid(Array.isArray(commit.parentShas), "Padres inválidos");
    commit.parentShas.forEach(sha);
    valid(
      new Set(commit.parentShas).size === commit.parentShas.length &&
        !commit.parentShas.includes(commit.sha),
      "Padres duplicados o autorreferentes",
    );
  }
  if (commit.committedAt !== null) {
    valid(
      typeof commit.committedAt === "string" &&
        Number.isFinite(Date.parse(commit.committedAt)),
      "Fecha de commit inválida",
    );
    valid(
      new Date(commit.committedAt).toISOString() === commit.committedAt,
      "La fecha debe estar normalizada como ISO 8601 UTC",
    );
  }
  if (commit.stats !== null) {
    valid(object(commit.stats), "Estadísticas inválidas");
    const { additions, deletions, total } = commit.stats;
    [additions, deletions, total].forEach(count);
    valid(total === additions + deletions, "Estadísticas inconsistentes");
  }
  if (commit.metrics !== null) {
    valid(object(commit.metrics), "Métricas inválidas");
    const metrics = commit.metrics;
    if (metrics.executionEventId !== null)
      text(metrics.executionEventId, "executionEventId");
    results(metrics.numPassedTests, metrics.failedTests, metrics.numTotalTests);
    coverage(metrics.coveragePercentage);
    valid(
      [null, "success", "failure", "neutral"].includes(metrics.conclusion),
      "Conclusión de métricas inválida",
    );
    valid(
      metrics.conclusion !== "success" || (metrics.failedTests ?? 0) === 0,
      "Una conclusión exitosa no puede tener pruebas fallidas",
    );
  }
}

function validateExecution(execution: TestExecutionRecord): void {
  valid(object(execution), "Ejecución inválida");
  // eventId es opaco para el dominio; el DTO externo exige UUID.
  text(execution.eventId, "eventId");
  if (execution.branchAtCapture !== null)
    text(execution.branchAtCapture, "branchAtCapture");
  if (execution.headShaAtExecution !== null) sha(execution.headShaAtExecution);
  if (execution.associatedCommitSha !== null)
    sha(execution.associatedCommitSha);
  count(execution.timestamp);
  valid(
    Number.isFinite(new Date(execution.timestamp).getTime()),
    "Timestamp inválido",
  );
  [
    execution.numPassedTests,
    execution.failedTests,
    execution.numTotalTests,
  ].forEach(count);
  results(
    execution.numPassedTests,
    execution.failedTests,
    execution.numTotalTests,
  );
  coverage(execution.coveragePercentage);
  valid(typeof execution.success === "boolean", "Resultado global inválido");
  valid(
    !execution.success || execution.failedTests === 0,
    "Éxito con pruebas fallidas",
  );
  if (execution.testId !== null) count(execution.testId);
}

export function validateBatch(batch: TDDHistoryBatch): void {
  valid(
    object(batch) && object(batch.repository),
    "Lote o repositorio inválido",
  );
  for (const field of ["provider", "owner", "name"] as const) {
    text(batch.repository[field], "repository." + field);
  }
  valid(
    Array.isArray(batch.branches) &&
      Array.isArray(batch.commits) &&
      Array.isArray(batch.branchCommits) &&
      Array.isArray(batch.executions),
    "El lote normalizado requiere branches, commits, branchCommits y executions",
  );
  for (const branch of batch.branches) {
    valid(object(branch), "Rama inválida");
    text(branch.name, "branch.name");
  }
  batch.commits.forEach(validateCommit);
  for (const relation of batch.branchCommits) {
    valid(object(relation), "Relación inválida");
    text(relation.branchName, "branchName");
    sha(relation.commitSha);
  }
  batch.executions.forEach(validateExecution);
}

export function mergeCommit(existing: CommitRecord, commit: CommitRecord): CommitRecord {
  const merged = mergeKnown(existing, commit, "commit." + commit.sha);
  validateCommit(merged);
  return structuredClone(merged);
}

export function mergeExecution(
  existing: TestExecutionRecord,
  execution: TestExecutionRecord,
): TestExecutionRecord {
  for (const field of ["branchAtCapture", "headShaAtExecution"] as const) {
    if (execution[field] !== null && execution[field] !== existing[field]) {
      throw new TDDHistoryConflictError(
        "La captura original es inmutable: " + field,
      );
    }
  }
  const merged = mergeKnown(
    existing,
    execution,
    "execution." + execution.eventId,
  );
  validateExecution(merged);
  return structuredClone(merged);
}
