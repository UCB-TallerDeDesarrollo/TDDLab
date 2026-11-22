import { TDDEventBatch, TDDExecutionEvent, TDDCommitEvent } from "./TDDEvents";

const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const sha = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;
const segment = /^[a-zA-Z0-9_.-]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 2_147_483_647;
}

function isTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 8_640_000_000_000_000;
}

function isBranch(value: unknown): boolean {
  return value === undefined || (typeof value === "string" && value.length > 0
    && value.length <= 255 && !/[\u0000-\u001f]/.test(value));
}

function isRewrite(value: unknown, target: string): boolean {
  return value === undefined || (isRecord(value)
    && typeof value.id === "string" && uuid.test(value.id)
    && Array.isArray(value.from) && value.from.length > 0 && value.from.length <= 1000
    && value.from.every(source => typeof source === "string" && sha.test(source)
      && source.toLowerCase() !== target.toLowerCase())
    && new Set(value.from.map(source => source.toLowerCase())).size === value.from.length);
}

function isExecution(value: unknown): value is TDDExecutionEvent {
  return isRecord(value)
    && typeof value.eventId === "string" && uuid.test(value.eventId)
    && isBranch(value.branch) && isTimestamp(value.timestamp)
    && isCount(value.numPassedTests) && isCount(value.failedTests) && isCount(value.numTotalTests)
    && value.numPassedTests + value.failedTests <= value.numTotalTests
    && typeof value.success === "boolean" && (!value.success || value.failedTests === 0)
    && (value.coverage === null || (typeof value.coverage === "number"
      && Number.isFinite(value.coverage) && value.coverage >= 0 && value.coverage <= 100));
}

function isCommit(value: unknown): value is TDDCommitEvent {
  return isRecord(value)
    && typeof value.sha === "string" && sha.test(value.sha)
    && isRewrite(value.rewrite, value.sha)
    && Array.isArray(value.parents) && value.parents.every((parent) => typeof parent === "string" && sha.test(parent))
    && typeof value.message === "string" && value.message.length <= 16_000
    && isTimestamp(value.timestamp) && isBranch(value.branch)
    && Array.isArray(value.executionIds) && value.executionIds.length <= 1000
    && value.executionIds.every((id) => typeof id === "string" && uuid.test(id))
    && new Set(value.executionIds.map(id => id.toLowerCase())).size === value.executionIds.length
    && isRecord(value.stats) && isCount(value.stats.additions) && isCount(value.stats.deletions)
    && isCount(value.stats.total) && value.stats.total === value.stats.additions + value.stats.deletions;
}

export class InvalidTDDEventsError extends Error {}

export function parseTDDEvents(value: unknown): TDDEventBatch {
  if (!isRecord(value)
    || typeof value.owner !== "string" || !segment.test(value.owner) || value.owner.length > 100
    || typeof value.repoName !== "string" || !segment.test(value.repoName) || value.repoName.length > 100
    || [value.owner, value.repoName].some((part) => part === "." || part === "..")
    || !Array.isArray(value.executions) || value.executions.length > 100 || !value.executions.every(isExecution)
    || !Array.isArray(value.commits) || value.commits.length > 20 || !value.commits.every(isCommit)) {
    throw new InvalidTDDEventsError("Invalid repository, executions or commits");
  }
  return {
    owner: value.owner.toLowerCase(),
    repoName: value.repoName.toLowerCase(),
    executions: value.executions.map(run => ({ ...run, eventId: run.eventId.toLowerCase() })),
    commits: value.commits.map(commit => ({
      ...commit,
      sha: commit.sha.toLowerCase(),
      parents: commit.parents.map(parent => parent.toLowerCase()),
      executionIds: commit.executionIds.map(id => id.toLowerCase()),
      ...(commit.rewrite ? { rewrite: {
        id: commit.rewrite.id.toLowerCase(),
        from: commit.rewrite.from.map(source => source.toLowerCase()).sort((left, right) => left.localeCompare(right)),
      } } : {}),
    })),
  };
}
