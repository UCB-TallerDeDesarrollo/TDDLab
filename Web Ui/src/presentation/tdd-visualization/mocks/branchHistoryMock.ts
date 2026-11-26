import type {
  BranchHistories,
  BranchHistory,
  BranchHistoryCommit,
  BranchHistoryExecution,
} from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";

/**
 * Datos de ejemplo para la gráfica de historial por ramas.
 *
 * Parten de los fixtures de branch-sync del backend
 * (server/test/__mocks__/TDDCycles/dataTypeMocks/BranchSyncMock.ts):
 * C0 en main; rama-a y rama-b parten de C0. Se agregan más commits para que
 * la gráfica muestre una evolución realista: ciclos rojo/verde en cada rama y
 * dos merges hacia main.
 *
 * Se exporta un `BranchHistories` ya listo para `BranchHistoryChart`, de modo
 * que las páginas no necesiten datos incrustados.
 */
const repository = {
  provider: "github",
  owner: "equipo-tddlab",
  name: "ejemplo-sprint4",
} as const;

export const mockCommitShas = {
  initial: "1111111111111111111111111111111111111111",
  branchA: "2222222222222222222222222222222222222222",
  branchB: "3333333333333333333333333333333333333333",
  branchAFix: "4444444444444444444444444444444444444444",
  branchBRefactor: "5555555555555555555555555555555555555555",
  branchAEdgeCases: "6666666666666666666666666666666666666666",
  mergeB: "7777777777777777777777777777777777777777",
  branchAEdgeFix: "8888888888888888888888888888888888888888",
  mergeA: "9999999999999999999999999999999999999999",
} as const;

interface MockCommitInput {
  index: number;
  sha: string;
  parentShas: string[];
  branchAtCapture: string;
  message: string;
  minute: number;
  passed: number;
  failed: number;
  coverage: number;
  additions: number;
  deletions: number;
}

const baseTime = Date.parse("2026-11-13T14:00:00.000Z");

function buildCommit(input: MockCommitInput) {
  const total = input.passed + input.failed;
  const success = input.failed === 0;
  const execution: BranchHistoryExecution = {
    eventId: `00000000-0000-4000-8000-${String(input.index).padStart(12, "0")}`,
    branchAtCapture: input.branchAtCapture,
    headShaAtExecution: input.parentShas[0] ?? null,
    associatedCommitSha: input.sha,
    timestamp: baseTime + (input.minute - 1) * 60_000,
    numPassedTests: input.passed,
    failedTests: input.failed,
    numTotalTests: total,
    coveragePercentage: input.coverage,
    success,
    testId: input.index - 1,
  };
  const commit: BranchHistoryCommit = {
    sha: input.sha,
    parentShas: input.parentShas,
    message: input.message,
    committedAt: new Date(baseTime + input.minute * 60_000),
    stats: {
      additions: input.additions,
      deletions: input.deletions,
      total: input.additions + input.deletions,
    },
    metrics: {
      executionEventId: execution.eventId,
      numPassedTests: input.passed,
      failedTests: input.failed,
      numTotalTests: total,
      coveragePercentage: input.coverage,
      conclusion: success ? "success" : "failure",
    },
  };
  return { commit, execution };
}

const s = mockCommitShas;
const initial = buildCommit({
  index: 1, sha: s.initial, parentShas: [], branchAtCapture: "main",
  message: "Crear implementación inicial", minute: 1,
  passed: 2, failed: 0, coverage: 80, additions: 10, deletions: 0,
});
const branchA = buildCommit({
  index: 2, sha: s.branchA, parentShas: [s.initial], branchAtCapture: "rama-a",
  message: "Agregar escenario de rama-a", minute: 11,
  passed: 2, failed: 1, coverage: 75, additions: 3, deletions: 1,
});
const branchB = buildCommit({
  index: 3, sha: s.branchB, parentShas: [s.initial], branchAtCapture: "rama-b",
  message: "Agregar escenario de rama-b", minute: 21,
  passed: 4, failed: 0, coverage: 90, additions: 2, deletions: 0,
});
const branchAFix = buildCommit({
  index: 4, sha: s.branchAFix, parentShas: [s.branchA], branchAtCapture: "rama-a",
  message: "Corregir prueba fallida de rama-a", minute: 31,
  passed: 3, failed: 0, coverage: 82, additions: 6, deletions: 2,
});
const branchBRefactor = buildCommit({
  index: 5, sha: s.branchBRefactor, parentShas: [s.branchB], branchAtCapture: "rama-b",
  message: "Refactorizar validaciones de rama-b", minute: 41,
  passed: 5, failed: 0, coverage: 91, additions: 9, deletions: 7,
});
const branchAEdgeCases = buildCommit({
  index: 6, sha: s.branchAEdgeCases, parentShas: [s.branchAFix], branchAtCapture: "rama-a",
  message: "Agregar pruebas de casos borde", minute: 51,
  passed: 4, failed: 2, coverage: 78, additions: 14, deletions: 0,
});
const mergeB = buildCommit({
  index: 7, sha: s.mergeB, parentShas: [s.initial, s.branchBRefactor], branchAtCapture: "main",
  message: "Merge rama-b en main", minute: 61,
  passed: 5, failed: 0, coverage: 91, additions: 11, deletions: 7,
});
const branchAEdgeFix = buildCommit({
  index: 8, sha: s.branchAEdgeFix, parentShas: [s.branchAEdgeCases], branchAtCapture: "rama-a",
  message: "Implementar casos borde", minute: 71,
  passed: 6, failed: 0, coverage: 88, additions: 12, deletions: 4,
});
const mergeA = buildCommit({
  index: 9, sha: s.mergeA, parentShas: [s.mergeB, s.branchAEdgeFix], branchAtCapture: "main",
  message: "Merge rama-a en main", minute: 81,
  passed: 9, failed: 0, coverage: 93, additions: 35, deletions: 7,
});

function branchOf(branch: string, entries: Array<ReturnType<typeof buildCommit>>): BranchHistory {
  return {
    repository,
    branch,
    commits: entries.map(entry => entry.commit),
    executions: entries.map(entry => entry.execution),
  };
}

export const branchHistoryMock: BranchHistories = {
  repository,
  branches: [
    branchOf("main", [initial, mergeB, mergeA]),
    branchOf("rama-a", [initial, branchA, branchAFix, branchAEdgeCases, branchAEdgeFix]),
    branchOf("rama-b", [initial, branchB, branchBRefactor]),
  ],
};
