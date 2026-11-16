import { CommitHistoryData } from "../Domain/ICommitHistoryData";
import { GitGraphCommit, TDDLogEntry } from "../Domain/TDDLogEntry";

export const fakeTDDRepository = { owner: "tddlab-demo", repoName: "branches" } as const;

export function createFakeTDDData() {
  const start = Date.UTC(2026, 10, 12, 14);
  const root = "a".repeat(40);
  const red = "b".repeat(40);
  const green = "c".repeat(40);
  const rounding = "d".repeat(40);
  const merge = "e".repeat(40);
  const runs = [
    { sha: red, message: "test: registrar el descuento pendiente", minute: 1, passed: 0, failed: 1, coverage: 50, cycle: "red" },
    { sha: rounding, message: "feat: redondear importes", minute: 2, passed: 2, failed: 0, coverage: 100, cycle: "green" },
    { sha: green, message: "fix: aplicar el descuento", minute: 3, passed: 1, failed: 0, coverage: 100, cycle: "green" },
  ];
  const graph: GitGraphCommit[] = [
    { sha: merge, parents: [green, rounding], subject: "merge: integrar descuentos y redondeo", timestamp: start + 240_000, historyBranch: "main" },
    { sha: green, parents: [red], subject: runs[2].message, timestamp: start + 180_000, recordedBranches: ["descuentos"] },
    { sha: rounding, parents: [root], subject: runs[1].message, timestamp: start + 120_000, recordedBranches: ["redondeo"] },
    { sha: red, parents: [root], subject: runs[0].message, timestamp: start + 60_000, recordedBranches: ["descuentos"] },
    { sha: root, parents: [], subject: "chore: iniciar práctica TDD", timestamp: start, historyBranch: "main" },
  ];
  const commits: CommitHistoryData[] = runs.map((run) => {
    const date = new Date(start + run.minute * 60_000);
    const url = `https://example.invalid/tddlab-demo/branches/commit/${run.sha}`;
    return {
      sha: run.sha,
      html_url: url,
      stats: { total: 3, additions: 2, deletions: 1, date: date.toISOString().slice(0, 10) },
      commit: { date, message: run.message, url, comment_count: 0 },
      coverage: run.coverage,
      test_count: run.passed + run.failed,
      conclusion: run.failed ? "failure" : "success",
    };
  }).reverse();
  const cycles = runs.map((run) => ({
    sha: run.sha,
    url: `https://example.invalid/tddlab-demo/branches/commit/${run.sha}`,
    tddCycle: run.cycle,
    coverage: run.coverage,
  }));
  const logs: TDDLogEntry[] = runs.flatMap((run, testId) => [
    {
      numPassedTests: run.passed,
      failedTests: run.failed,
      numTotalTests: run.passed + run.failed,
      timestamp: start + run.minute * 60_000 - 1_000,
      success: run.failed === 0,
      testId,
    },
    {
      commitId: run.sha,
      commitName: run.message,
      commitTimestamp: start + run.minute * 60_000,
      testId,
      ...(testId === 0 ? { gitGraph: graph } : {}),
    },
  ]);
  return { commits, cycles, logs };
}
