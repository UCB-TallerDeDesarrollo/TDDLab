import type { TDDLogEntry, TestExecutionLog } from "../domain/TDDLogInterfaces";

export function indexCommitShas(logs: readonly { testId: number; commitId?: string }[]) {
  const candidates = new Map<number, Set<string>>();
  for (const { testId, commitId } of logs) {
    if (!Number.isSafeInteger(testId) || !commitId) continue;
    const shas = candidates.get(testId) ?? new Set<string>();
    shas.add(commitId);
    candidates.set(testId, shas);
  }

  const byTestId = new Map<number, string>();
  for (const [testId, shas] of candidates) {
    const [sha] = shas;
    if (shas.size === 1 && sha !== "HEAD") byTestId.set(testId, sha);
  }
  return byTestId;
}

export function indexTestsByCommit(logs: readonly TDDLogEntry[]) {
  const byTestId = indexCommitShas(logs.map(log => ({
    testId: log.testId,
    commitId: "commitId" in log ? log.commitId : undefined,
  })));
  const byCommit = new Map<string, TestExecutionLog[]>();
  for (const log of logs) {
    if ("commitId" in log) continue;
    const sha = byTestId.get(log.testId);
    if (!sha) continue;
    const tests = byCommit.get(sha) ?? [];
    tests.push(log);
    byCommit.set(sha, tests);
  }
  for (const tests of byCommit.values()) tests.sort((a, b) => a.timestamp - b.timestamp);
  return byCommit;
}

export function testResult(test: { success?: boolean; failedTests?: number }) {
  if (test.success === false || (test.failedTests ?? 0) > 0) return "failure";
  if (test.success === true) return "success";
  return "unknown";
}
