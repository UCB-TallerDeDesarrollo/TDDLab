import type {
  CommitRecord,
  RepositoryKey,
  TDDHistoryBatch,
} from "../Domain/TDDHistory";
import { valid, validateBatch } from "../Domain/TDDHistoryWriteRules";

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

const fullSha = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** External identities are exact and must already be normalized by the sender. */
export function parseBranchSyncRepository(value: unknown): RepositoryKey {
  valid(record(value), "repository debe ser un objeto");
  valid(value.provider === "github", "El proveedor debe ser github");
  for (const field of ["owner", "name"] as const) {
    valid(
      typeof value[field] === "string" &&
        /^[A-Za-z0-9._-]{1,100}$/.test(value[field]),
      "repository." + field + " debe ser un nombre, no una URL",
    );
  }
  return {
    provider: "github",
    owner: value.owner as string,
    name: value.name as string,
  };
}

function commitFields(commit: CommitRecord): CommitRecord {
  return {
    sha: commit.sha,
    parentShas: commit.parentShas === null ? null : [...commit.parentShas],
    message: commit.message,
    committedAt: commit.committedAt,
    stats:
      commit.stats === null
        ? null
        : {
            additions: commit.stats.additions,
            deletions: commit.stats.deletions,
            total: commit.stats.total,
          },
    metrics:
      commit.metrics === null
        ? null
        : {
            executionEventId: commit.metrics.executionEventId,
            numPassedTests: commit.metrics.numPassedTests,
            failedTests: commit.metrics.failedTests,
            numTotalTests: commit.metrics.numTotalTests,
            coveragePercentage: commit.metrics.coveragePercentage,
            conclusion: commit.metrics.conclusion,
          },
  };
}

/** Validate JSON at runtime, then select domain fields; never persist the DTO itself. */
export function normalizeBranchSyncData(input: unknown): TDDHistoryBatch {
  valid(record(input), "El lote de sincronización debe ser un objeto");
  valid(input.schemaVersion === 1, "schemaVersion debe ser 1");
  valid(input.mode === "incremental", "mode debe ser incremental");
  const repository = parseBranchSyncRepository(input.repository);
  valid(record(input.branch), "branch debe ser un objeto");
  const branch = input.branch;
  valid(
    branch.headSha === null ||
      (typeof branch.headSha === "string" && fullSha.test(branch.headSha)),
    "branch.headSha debe ser un SHA completo o null",
  );
  valid(
    branch.expectedHeadVersion === null ||
      (typeof branch.expectedHeadVersion === "number" &&
        Number.isSafeInteger(branch.expectedHeadVersion) &&
        branch.expectedHeadVersion >= 0),
    "branch.expectedHeadVersion debe ser un entero no negativo o null",
  );
  valid(
    Array.isArray(input.commits) &&
      Array.isArray(input.branchCommitShas) &&
      Array.isArray(input.executions),
    "commits, branchCommitShas y executions deben ser arreglos",
  );

  // These assertions do not confer trust: validateBatch checks every nested field below.
  const batch: TDDHistoryBatch = {
    repository,
    branches: [{ name: branch.name as string }],
    commits: input.commits as unknown as TDDHistoryBatch["commits"],
    branchCommits: input.branchCommitShas.map((commitSha: unknown) => ({
      branchName: branch.name as string,
      commitSha: commitSha as string,
    })),
    executions: input.executions as unknown as TDDHistoryBatch["executions"],
  };
  validateBatch(batch);
  for (const execution of batch.executions) {
    valid(
      uuid.test(execution.eventId),
      "eventId debe ser un UUID canónico estable",
    );
  }
  for (const commit of batch.commits) {
    const eventId = commit.metrics?.executionEventId;
    valid(
      eventId == null || uuid.test(eventId),
      "executionEventId debe ser un UUID canónico o null",
    );
  }

  return {
    repository,
    branches: batch.branches.map(({ name }) => ({ name })),
    commits: batch.commits.map(commitFields),
    branchCommits: batch.branchCommits.map(({ branchName, commitSha }) => ({
      branchName,
      commitSha,
    })),
    executions: batch.executions.map((execution) => ({
      eventId: execution.eventId,
      branchAtCapture: execution.branchAtCapture,
      headShaAtExecution: execution.headShaAtExecution,
      associatedCommitSha: execution.associatedCommitSha,
      timestamp: execution.timestamp,
      numPassedTests: execution.numPassedTests,
      failedTests: execution.failedTests,
      numTotalTests: execution.numTotalTests,
      coveragePercentage: execution.coveragePercentage,
      success: execution.success,
      testId: execution.testId,
    })),
  };
}
