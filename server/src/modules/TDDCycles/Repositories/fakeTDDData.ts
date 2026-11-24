import { CommitHistoryData } from "../Domain/ICommitHistoryData";
import { GitGraphCommit, TDDLogEntry } from "../Domain/TDDLogEntry";

export const fakeTDDRepository = { owner: "tddlab-demo", repoName: "branches" } as const;
export const fakeRichTDDRepository = { owner: "tddlab-demo", repoName: "branches-demo" } as const;

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

interface RichRunSpec {
  sha: string;
  message: string;
  minute: number;
  additions: number;
  deletions: number;
  coverage: number;
  cycle: string;
  executions: Array<{ passed: number; failed: number }>;
}

export function createRichFakeTDDData() {
  const start = Date.UTC(2026, 10, 14, 15);
  const sha = (hex: string) => hex.repeat(40);
  const c1 = sha("1");
  const c2 = sha("2");
  const c3 = sha("3");
  const c4 = sha("4");
  const c5 = sha("5");
  const c6 = sha("6");
  const c7 = sha("7");
  const c8 = sha("8");
  const c9 = sha("9");
  const c10 = sha("a");
  const c11 = sha("b");
  const c12 = sha("c");

  const runs: RichRunSpec[] = [
    {
      sha: c2,
      message: "feat: estructura base del carrito",
      minute: 2,
      additions: 19,
      deletions: 2,
      coverage: 76,
      cycle: "RojoVerde",
      executions: [
        { passed: 0, failed: 2 },
        { passed: 2, failed: 0 },
      ],
    },
    {
      sha: c3,
      message: "test: registrar descuento por volumen pendiente",
      minute: 4,
      additions: 18,
      deletions: 0,
      coverage: 42,
      cycle: "Rojo",
      executions: [{ passed: 0, failed: 1 }],
    },
    {
      sha: c4,
      message: "test: redondeo a dos decimales",
      minute: 6,
      additions: 15,
      deletions: 1,
      coverage: 48,
      cycle: "Rojo",
      executions: [{ passed: 0, failed: 2 }],
    },
    {
      sha: c5,
      message: "feat: aplicar descuento por volumen",
      minute: 9,
      additions: 24,
      deletions: 4,
      coverage: 84,
      cycle: "RojoVerde",
      executions: [
        { passed: 1, failed: 2 },
        { passed: 3, failed: 0 },
      ],
    },
    {
      sha: c6,
      message: "feat: redondear importes con precisión",
      minute: 12,
      additions: 17,
      deletions: 3,
      coverage: 91,
      cycle: "RojoVerde",
      executions: [
        { passed: 1, failed: 1 },
        { passed: 3, failed: 0 },
      ],
    },
    {
      sha: c7,
      message: "refactor: extraer estrategia de descuentos",
      minute: 15,
      additions: 14,
      deletions: 8,
      coverage: 95,
      cycle: "Verde",
      executions: [
        { passed: 4, failed: 0 },
        { passed: 4, failed: 0 },
      ],
    },
    {
      sha: c8,
      message: "merge: integrar descuentos en main",
      minute: 17,
      additions: 24,
      deletions: 6,
      coverage: 92,
      cycle: "Verde",
      executions: [{ passed: 5, failed: 0 }],
    },
    {
      sha: c9,
      message: "test: validar cupón expirado",
      minute: 20,
      additions: 17,
      deletions: 2,
      coverage: 58,
      cycle: "Rojo",
      executions: [{ passed: 1, failed: 1 }],
    },
    {
      sha: c10,
      message: "feat: soportar cupones porcentuales",
      minute: 24,
      additions: 25,
      deletions: 5,
      coverage: 88,
      cycle: "RojoVerde",
      executions: [
        { passed: 2, failed: 3 },
        { passed: 4, failed: 1 },
        { passed: 6, failed: 0 },
      ],
    },
    {
      sha: c11,
      message: "merge: integrar redondeo en main",
      minute: 28,
      additions: 22,
      deletions: 7,
      coverage: 95,
      cycle: "Verde",
      executions: [{ passed: 6, failed: 0 }],
    },
  ];

  const graph: GitGraphCommit[] = [
    { sha: c12, parents: [c11, c10], subject: "merge: integrar módulo de cupones", timestamp: start + 32 * 60_000, historyBranch: "main" },
    { sha: c11, parents: [c8, c6], subject: "merge: integrar redondeo en main", timestamp: start + 28 * 60_000, historyBranch: "main" },
    { sha: c10, parents: [c9], subject: "feat: soportar cupones porcentuales", timestamp: start + 24 * 60_000, recordedBranches: ["feature/cupones"] },
    { sha: c9, parents: [c8], subject: "test: validar cupón expirado", timestamp: start + 20 * 60_000, recordedBranches: ["feature/cupones"] },
    { sha: c8, parents: [c2, c7], subject: "merge: integrar descuentos en main", timestamp: start + 17 * 60_000, historyBranch: "main" },
    { sha: c7, parents: [c5], subject: "refactor: extraer estrategia de descuentos", timestamp: start + 15 * 60_000, recordedBranches: ["feature/descuentos"] },
    { sha: c6, parents: [c4], subject: "feat: redondear importes con precisión", timestamp: start + 12 * 60_000, recordedBranches: ["feature/redondeo"] },
    { sha: c5, parents: [c3], subject: "feat: aplicar descuento por volumen", timestamp: start + 9 * 60_000, recordedBranches: ["feature/descuentos"] },
    { sha: c4, parents: [c2], subject: "test: redondeo a dos decimales", timestamp: start + 6 * 60_000, recordedBranches: ["feature/redondeo"] },
    { sha: c3, parents: [c2], subject: "test: registrar descuento por volumen pendiente", timestamp: start + 4 * 60_000, recordedBranches: ["feature/descuentos"] },
    { sha: c2, parents: [c1], subject: "feat: estructura base del carrito", timestamp: start + 2 * 60_000, historyBranch: "main" },
    { sha: c1, parents: [], subject: "chore: iniciar práctica TDD", timestamp: start, historyBranch: "main" },
  ];

  const baseUrl = `https://example.invalid/${fakeRichTDDRepository.owner}/${fakeRichTDDRepository.repoName}/commit`;

  const commits: CommitHistoryData[] = runs
    .map((run) => {
      const date = new Date(start + run.minute * 60_000);
      const url = `${baseUrl}/${run.sha}`;
      const lastExecution = run.executions[run.executions.length - 1];
      return {
        sha: run.sha,
        html_url: url,
        stats: {
          total: run.additions + run.deletions,
          additions: run.additions,
          deletions: run.deletions,
          date: date.toISOString().slice(0, 10),
        },
        commit: { date, message: run.message, url, comment_count: 0 },
        coverage: run.coverage,
        test_count: lastExecution.passed + lastExecution.failed,
        conclusion: lastExecution.failed > 0 ? "failure" : "success",
      };
    })
    .reverse();

  const cycles = runs.map((run) => ({
    sha: run.sha,
    url: `${baseUrl}/${run.sha}`,
    tddCycle: run.cycle,
    coverage: run.coverage,
  }));

  const logs: TDDLogEntry[] = runs.flatMap((run, testId) => {
    const commitTime = start + run.minute * 60_000;
    const executionEntries: TDDLogEntry[] = run.executions.map((exec, execIndex) => ({
      numPassedTests: exec.passed,
      failedTests: exec.failed,
      numTotalTests: exec.passed + exec.failed,
      timestamp: commitTime - (run.executions.length - execIndex) * 5_000,
      success: exec.failed === 0,
      testId,
    }));

    return [
      ...executionEntries,
      {
        commitId: run.sha,
        commitName: run.message,
        commitTimestamp: commitTime,
        testId,
        ...(testId === 0 ? { gitGraph: graph } : {}),
      },
    ];
  });

  return { commits, cycles, logs };
}
