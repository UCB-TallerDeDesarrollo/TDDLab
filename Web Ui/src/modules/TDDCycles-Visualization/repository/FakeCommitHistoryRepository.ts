import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { CommitDataObject } from "../domain/githubCommitInterfaces";
import { CommitCycle } from "../domain/TddCycleInterface";
import { TDDLogEntry, GitGraphCommit } from "../domain/TDDLogInterfaces";

function safeClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

interface FakeDataset {
  commits: CommitDataObject[];
  cycles: CommitCycle[];
  logs: TDDLogEntry[];
}

function buildRichShowcaseDataset(): FakeDataset {
  const start = new Date("2026-11-14T15:00:00.000Z").getTime();
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

  const runs: Array<{
    sha: string;
    message: string;
    minute: number;
    additions: number;
    deletions: number;
    coverage: number | null;
    cycle: string;
    executions: Array<{ passed: number; failed: number }>;
  }> = [
    { sha: c2, message: "feat: estructura base del carrito", minute: 2, additions: 19, deletions: 2, coverage: 76, cycle: "RojoVerde", executions: [{ passed: 0, failed: 2 }, { passed: 2, failed: 0 }] },
    { sha: c3, message: "test: registrar descuento por volumen pendiente", minute: 4, additions: 18, deletions: 0, coverage: 42, cycle: "Rojo", executions: [{ passed: 0, failed: 1 }] },
    { sha: c4, message: "test: redondeo a dos decimales", minute: 6, additions: 15, deletions: 1, coverage: null, cycle: "Rojo", executions: [{ passed: 0, failed: 2 }] },
    { sha: c5, message: "feat: aplicar descuento por volumen", minute: 9, additions: 24, deletions: 4, coverage: 84, cycle: "RojoVerde", executions: [{ passed: 1, failed: 2 }, { passed: 3, failed: 0 }] },
    { sha: c6, message: "feat: redondear importes con precisión", minute: 12, additions: 17, deletions: 3, coverage: 91, cycle: "RojoVerde", executions: [{ passed: 1, failed: 1 }, { passed: 3, failed: 0 }] },
    { sha: c7, message: "refactor: extraer estrategia de descuentos", minute: 15, additions: 14, deletions: 8, coverage: 95, cycle: "Verde", executions: [{ passed: 4, failed: 0 }, { passed: 4, failed: 0 }] },
    { sha: c8, message: "merge: integrar descuentos en main", minute: 17, additions: 24, deletions: 6, coverage: 92, cycle: "Verde", executions: [{ passed: 5, failed: 0 }] },
    { sha: c9, message: "test: validar cupón expirado", minute: 20, additions: 17, deletions: 2, coverage: 58, cycle: "Rojo", executions: [{ passed: 1, failed: 1 }] },
    { sha: c10, message: "feat: soportar cupones porcentuales", minute: 24, additions: 25, deletions: 5, coverage: 88, cycle: "RojoVerde", executions: [{ passed: 2, failed: 3 }, { passed: 4, failed: 1 }, { passed: 6, failed: 0 }] },
    { sha: c11, message: "merge: integrar redondeo en main", minute: 28, additions: 22, deletions: 7, coverage: 95, cycle: "Verde", executions: [{ passed: 6, failed: 0 }] },
  ];

  const baseUrl = "https://github.com/tddlab-demo/branches-demo/commit";

  const commits: CommitDataObject[] = runs
    .map((run) => {
      const last = run.executions[run.executions.length - 1];
      return {
        sha: run.sha,
        html_url: `${baseUrl}/${run.sha}`,
        stats: {
          total: run.additions + run.deletions,
          additions: run.additions,
          deletions: run.deletions,
        },
        commit: {
          date: new Date(start + run.minute * 60_000),
          message: run.message,
          url: `${baseUrl}/${run.sha}`,
          comment_count: 0,
        },
        coverage: run.coverage,
        test_count: last.passed + last.failed,
        conclusion: last.failed > 0 ? "failure" : "success",
      };
    })
    .reverse();

  const cycles: CommitCycle[] = runs.map((run) => ({
    sha: run.sha,
    url: `${baseUrl}/${run.sha}`,
    tddCycle: run.cycle,
  })).reverse();

  const logs: TDDLogEntry[] = runs.flatMap((run, testId) => {
    const commitTime = start + run.minute * 60_000;
    const executionEntries: TDDLogEntry[] = run.executions.map((exec, index) => ({
      numPassedTests: exec.passed,
      failedTests: exec.failed,
      numTotalTests: exec.passed + exec.failed,
      timestamp: commitTime - (run.executions.length - index) * 5_000,
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

export class FakeCommitHistoryRepository implements CommitHistoryRepository {
  private readonly defaultDataset: FakeDataset;
  private readonly showcaseDataset: FakeDataset;
  private readonly fakeUserName: string;

  constructor() {
    this.fakeUserName = "TDDLab Demo User";

    const baseTime = new Date("2026-11-12T14:00:00.000Z").getTime();
    const sha1 = "a".repeat(40);
    const sha2 = "b".repeat(40);
    const sha3 = "c".repeat(40);
    const sha4 = "d".repeat(40);
    const sha5 = "e".repeat(40);

    const graph: GitGraphCommit[] = [
      { sha: sha5, parents: [sha3, sha4], subject: "merge: integrar descuentos y redondeo", timestamp: baseTime + 240000, historyBranch: "main" },
      { sha: sha3, parents: [sha2], subject: "fix: aplicar el descuento", timestamp: baseTime + 180000, recordedBranches: ["descuentos"] },
      { sha: sha4, parents: [sha1], subject: "feat: redondear importes", timestamp: baseTime + 120000, recordedBranches: ["redondeo"] },
      { sha: sha2, parents: [sha1], subject: "test: registrar el descuento pendiente", timestamp: baseTime + 60000, recordedBranches: ["descuentos"] },
      { sha: sha1, parents: [], subject: "chore: iniciar práctica TDD", timestamp: baseTime, historyBranch: "main" },
    ];

    const fakeCommits: CommitDataObject[] = [
      {
        sha: sha5,
        html_url: `https://github.com/tddlab-demo/branches/commit/${sha5}`,
        stats: { total: 32, additions: 24, deletions: 8 },
        commit: {
          date: new Date(baseTime + 240000),
          message: "merge: integrar descuentos y redondeo",
          url: `https://github.com/tddlab-demo/branches/commit/${sha5}`,
          comment_count: 0,
        },
        coverage: 100,
        test_count: 3,
        conclusion: "success",
      },
      {
        sha: sha3,
        html_url: `https://github.com/tddlab-demo/branches/commit/${sha3}`,
        stats: { total: 14, additions: 12, deletions: 2 },
        commit: {
          date: new Date(baseTime + 180000),
          message: "fix: aplicar el descuento",
          url: `https://github.com/tddlab-demo/branches/commit/${sha3}`,
          comment_count: 0,
        },
        coverage: 100,
        test_count: 2,
        conclusion: "success",
      },
      {
        sha: sha4,
        html_url: `https://github.com/tddlab-demo/branches/commit/${sha4}`,
        stats: { total: 18, additions: 14, deletions: 4 },
        commit: {
          date: new Date(baseTime + 120000),
          message: "feat: redondear importes",
          url: `https://github.com/tddlab-demo/branches/commit/${sha4}`,
          comment_count: 0,
        },
        coverage: 100,
        test_count: 2,
        conclusion: "success",
      },
      {
        sha: sha2,
        html_url: `https://github.com/tddlab-demo/branches/commit/${sha2}`,
        stats: { total: 25, additions: 25, deletions: 0 },
        commit: {
          date: new Date(baseTime + 60000),
          message: "test: registrar el descuento pendiente",
          url: `https://github.com/tddlab-demo/branches/commit/${sha2}`,
          comment_count: 0,
        },
        coverage: 50,
        test_count: 1,
        conclusion: "failure",
      },
    ];

    const fakeCycles: CommitCycle[] = [
      { sha: sha5, url: `https://github.com/tddlab-demo/branches/commit/${sha5}`, tddCycle: "green" },
      { sha: sha3, url: `https://github.com/tddlab-demo/branches/commit/${sha3}`, tddCycle: "green" },
      { sha: sha4, url: `https://github.com/tddlab-demo/branches/commit/${sha4}`, tddCycle: "green" },
      { sha: sha2, url: `https://github.com/tddlab-demo/branches/commit/${sha2}`, tddCycle: "red" },
    ];

    const fakeLogs: TDDLogEntry[] = [
      {
        numPassedTests: 0,
        failedTests: 1,
        numTotalTests: 1,
        timestamp: baseTime + 59000,
        success: false,
        testId: 0,
      },
      {
        commitId: sha2,
        commitName: "test: registrar el descuento pendiente",
        commitTimestamp: baseTime + 60000,
        testId: 0,
        gitGraph: graph,
      },
      {
        numPassedTests: 2,
        failedTests: 0,
        numTotalTests: 2,
        timestamp: baseTime + 119000,
        success: true,
        testId: 1,
      },
      {
        commitId: sha4,
        commitName: "feat: redondear importes",
        commitTimestamp: baseTime + 120000,
        testId: 1,
      },
      {
        numPassedTests: 1,
        failedTests: 0,
        numTotalTests: 1,
        timestamp: baseTime + 179000,
        success: true,
        testId: 2,
      },
      {
        commitId: sha3,
        commitName: "fix: aplicar el descuento",
        commitTimestamp: baseTime + 180000,
        testId: 2,
      },
      {
        commitId: sha5,
        commitName: "merge: integrar descuentos y redondeo",
        commitTimestamp: baseTime + 240000,
        testId: 3,
      },
    ];

    this.defaultDataset = {
      commits: fakeCommits,
      cycles: fakeCycles,
      logs: fakeLogs,
    };
    this.showcaseDataset = buildRichShowcaseDataset();
  }

  private getDataset(repoName: string): FakeDataset {
    return repoName === "branches-demo" ? this.showcaseDataset : this.defaultDataset;
  }

  async obtainCommitsOfRepo(_owner: string, repoName: string): Promise<CommitDataObject[]> {
    void _owner;
    const cloned = safeClone(this.getDataset(repoName).commits);
    return cloned.map((commit) => ({
      ...commit,
      commit: {
        ...commit.commit,
        date: new Date(commit.commit.date),
      },
    }));
  }

  async obtainUserName(_owner: string): Promise<string> {
    void _owner;
    return this.fakeUserName;
  }

  async obtainCommitTddCycle(_owner: string, repoName: string): Promise<CommitCycle[]> {
    void _owner;
    return safeClone(this.getDataset(repoName).cycles);
  }

  async obtainTDDLogs(_owner: string, repoName: string): Promise<TDDLogEntry[]> {
    void _owner;
    return safeClone(this.getDataset(repoName).logs);
  }
}
