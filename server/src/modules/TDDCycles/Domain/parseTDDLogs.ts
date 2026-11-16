import { GitGraphCommit, TDDLogEntry } from "./TDDLogEntry";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isCount(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

function isStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isGraphCommit(value: unknown): value is GitGraphCommit {
  return isRecord(value)
    && typeof value.sha === "string"
    && isStrings(value.parents)
    && typeof value.subject === "string"
    && (value.timestamp === undefined || isNumber(value.timestamp))
    && (value.body === undefined || typeof value.body === "string")
    && (value.recordedBranches === undefined || isStrings(value.recordedBranches))
    && (value.historyBranch === undefined || typeof value.historyBranch === "string");
}

function isLogEntry(value: unknown): value is TDDLogEntry {
  if (!isRecord(value) || !isCount(value.testId)) {
    return false;
  }

  if ("commitId" in value) {
    return typeof value.commitId === "string"
      && typeof value.commitName === "string"
      && isNumber(value.commitTimestamp)
      && (value.gitGraph === undefined
        || (Array.isArray(value.gitGraph) && value.gitGraph.every(isGraphCommit)));
  }

  return isCount(value.numPassedTests)
    && isCount(value.failedTests)
    && isCount(value.numTotalTests)
    && isNumber(value.timestamp)
    && typeof value.success === "boolean";
}

export function parseTDDLogs(value: unknown): TDDLogEntry[] {
  if (!Array.isArray(value) || !value.every(isLogEntry)) {
    throw new Error("Invalid tdd_log.json: expected test executions and commit records");
  }
  return value;
}
