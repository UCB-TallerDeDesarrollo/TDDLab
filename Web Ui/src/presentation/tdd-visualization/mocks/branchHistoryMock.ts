import type {
  BranchHistories,
  BranchHistory,
  BranchHistoryCommit,
  BranchHistoryExecution,
} from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";

/**
 * Datos de ejemplo para la gráfica de historial por ramas.
 *
 * Se basan en los fixtures de branch-sync del backend
 * (server/test/__mocks__/TDDCycles/dataTypeMocks/BranchSyncMock.ts):
 * C0 en main; rama-a y rama-b parten de C0; main recibe los commits de ambas ramas.
 *
 * Se exporta un `BranchHistories` ya listo para `BranchHistoryChart`, de modo
 * que las páginas no necesiten datos incrustados. El commit de merge se omite
 * porque el fixture no registra ejecuciones de pruebas para él.
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
} as const;

const initialExecution: BranchHistoryExecution = {
  eventId: "00000000-0000-4000-8000-000000000001",
  branchAtCapture: "main",
  headShaAtExecution: null,
  associatedCommitSha: mockCommitShas.initial,
  timestamp: Date.parse("2026-11-13T14:00:00.000Z"),
  numPassedTests: 2,
  failedTests: 0,
  numTotalTests: 2,
  coveragePercentage: 80,
  success: true,
  testId: 0,
};

const branchAExecution: BranchHistoryExecution = {
  eventId: "00000000-0000-4000-8000-000000000002",
  branchAtCapture: "rama-a",
  headShaAtExecution: mockCommitShas.initial,
  associatedCommitSha: mockCommitShas.branchA,
  timestamp: Date.parse("2026-11-13T14:10:00.000Z"),
  numPassedTests: 2,
  failedTests: 1,
  numTotalTests: 3,
  coveragePercentage: 75,
  success: false,
  testId: 1,
};

const branchBExecution: BranchHistoryExecution = {
  eventId: "00000000-0000-4000-8000-000000000003",
  branchAtCapture: "rama-b",
  headShaAtExecution: mockCommitShas.initial,
  associatedCommitSha: mockCommitShas.branchB,
  timestamp: Date.parse("2026-11-13T14:20:00.000Z"),
  numPassedTests: 4,
  failedTests: 0,
  numTotalTests: 4,
  coveragePercentage: 90,
  success: true,
  testId: 1,
};

const initialCommit: BranchHistoryCommit = {
  sha: mockCommitShas.initial,
  parentShas: [],
  message: "Crear implementación inicial",
  committedAt: new Date("2026-11-13T14:01:00.000Z"),
  stats: { additions: 10, deletions: 0, total: 10 },
  metrics: {
    executionEventId: initialExecution.eventId,
    numPassedTests: initialExecution.numPassedTests,
    failedTests: initialExecution.failedTests,
    numTotalTests: initialExecution.numTotalTests,
    coveragePercentage: initialExecution.coveragePercentage,
    conclusion: "success",
  },
};

const branchACommit: BranchHistoryCommit = {
  sha: mockCommitShas.branchA,
  parentShas: [mockCommitShas.initial],
  message: "Agregar escenario de rama-a",
  committedAt: new Date("2026-11-13T14:11:00.000Z"),
  stats: { additions: 3, deletions: 1, total: 4 },
  metrics: {
    executionEventId: branchAExecution.eventId,
    numPassedTests: branchAExecution.numPassedTests,
    failedTests: branchAExecution.failedTests,
    numTotalTests: branchAExecution.numTotalTests,
    coveragePercentage: branchAExecution.coveragePercentage,
    conclusion: "failure",
  },
};

const branchBCommit: BranchHistoryCommit = {
  sha: mockCommitShas.branchB,
  parentShas: [mockCommitShas.initial],
  message: "Agregar escenario de rama-b",
  committedAt: new Date("2026-11-13T14:21:00.000Z"),
  stats: { additions: 2, deletions: 0, total: 2 },
  metrics: {
    executionEventId: branchBExecution.eventId,
    numPassedTests: branchBExecution.numPassedTests,
    failedTests: branchBExecution.failedTests,
    numTotalTests: branchBExecution.numTotalTests,
    coveragePercentage: branchBExecution.coveragePercentage,
    conclusion: "success",
  },
};

const mainBranch: BranchHistory = {
  repository,
  branch: "main",
  commits: [initialCommit, branchBCommit],
  executions: [initialExecution, branchBExecution],
};

const branchABranch: BranchHistory = {
  repository,
  branch: "rama-a",
  commits: [initialCommit, branchACommit],
  executions: [initialExecution, branchAExecution],
};

const branchBBranch: BranchHistory = {
  repository,
  branch: "rama-b",
  commits: [initialCommit, branchBCommit],
  executions: [initialExecution, branchBExecution],
};

export const branchHistoryMock: BranchHistories = {
  repository,
  branches: [mainBranch, branchABranch, branchBBranch],
};
