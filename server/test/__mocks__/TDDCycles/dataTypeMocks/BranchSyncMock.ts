import type {
  BranchSyncCommit,
  BranchSyncCommitMetrics,
  BranchSyncData,
  BranchSyncExecution,
  BranchSyncRepository,
} from "../../../../src/modules/TDDCycles/Application/BranchSyncData";

/**
 * Fixtures deterministas: SHA sintéticos y UUID estables.
 * No generan eventos nuevos ni dependen de Jest, Git, red o PostgreSQL.
 *
 * Secuencia: C0 en main; rama-a y rama-b parten de C0; main avanza a A
 * mediante fast-forward y fusiona B, creando M con padres [A, B].
 * El lote final informa ese resultado sin exigir sincronizar el paso A.
 *
 * Los JSON equivalentes están en ./branch-sync/ y pueden compartirse
 * directamente con TDDLabBaseProject sin instalar TypeScript.
 * Para exportarlos: JSON.stringify(branchSyncMocks[nombre], null, 2).
 *
 * Las versiones 0 y 1 ilustran el mecanismo candidato del backend;
 * la captura local no necesita conocerlas y puede sincronizar con null.
 */
export const commitShas = {
  initial: "1111111111111111111111111111111111111111",
  branchA: "2222222222222222222222222222222222222222",
  branchB: "3333333333333333333333333333333333333333",
  merge: "4444444444444444444444444444444444444444",
} as const;

export const repositoryMock: BranchSyncRepository = {
  provider: "github",
  owner: "equipo-tddlab",
  name: "ejemplo-sprint4",
};

export const initialExecution: BranchSyncExecution = {
  eventId: "00000000-0000-4000-8000-000000000001",
  branchAtCapture: "main",
  headShaAtExecution: null,
  associatedCommitSha: commitShas.initial,
  timestamp: Date.parse("2026-11-13T14:00:00.000Z"),
  numPassedTests: 2,
  failedTests: 0,
  numTotalTests: 2,
  coveragePercentage: 80,
  success: true,
  testId: 0,
};

export const branchAExecution: BranchSyncExecution = {
  eventId: "00000000-0000-4000-8000-000000000002",
  branchAtCapture: "rama-a",
  headShaAtExecution: commitShas.initial,
  associatedCommitSha: commitShas.branchA,
  timestamp: Date.parse("2026-11-13T14:10:00.000Z"),
  numPassedTests: 2,
  failedTests: 1,
  numTotalTests: 3,
  coveragePercentage: 75,
  success: false,
  testId: 1,
};

export const branchBExecution: BranchSyncExecution = {
  eventId: "00000000-0000-4000-8000-000000000003",
  branchAtCapture: "rama-b",
  headShaAtExecution: commitShas.initial,
  associatedCommitSha: commitShas.branchB,
  timestamp: Date.parse("2026-11-13T14:20:00.000Z"),
  numPassedTests: 4,
  failedTests: 0,
  numTotalTests: 4,
  coveragePercentage: 90,
  success: true,
  testId: 1,
};

function metricsFrom(
  execution: BranchSyncExecution,
): BranchSyncCommitMetrics {
  return {
    executionEventId: execution.eventId,
    numPassedTests: execution.numPassedTests,
    failedTests: execution.failedTests,
    numTotalTests: execution.numTotalTests,
    coveragePercentage: execution.coveragePercentage,
    conclusion: execution.success ? "success" : "failure",
  };
}

export const initialCommit: BranchSyncCommit = {
  sha: commitShas.initial,
  parentShas: [],
  message: "Crear implementación inicial",
  committedAt: "2026-11-13T14:01:00.000Z",
  stats: { additions: 10, deletions: 0, total: 10 },
  metrics: metricsFrom(initialExecution),
};

export const branchACommit: BranchSyncCommit = {
  sha: commitShas.branchA,
  parentShas: [commitShas.initial],
  message: "Agregar escenario de rama-a",
  committedAt: "2026-11-13T14:11:00.000Z",
  stats: { additions: 3, deletions: 1, total: 4 },
  metrics: metricsFrom(branchAExecution),
};

export const branchBCommit: BranchSyncCommit = {
  sha: commitShas.branchB,
  parentShas: [commitShas.initial],
  message: "Agregar escenario de rama-b",
  committedAt: "2026-11-13T14:21:00.000Z",
  stats: { additions: 2, deletions: 0, total: 2 },
  metrics: metricsFrom(branchBExecution),
};

export const mergeCommit: BranchSyncCommit = {
  sha: commitShas.merge,
  parentShas: [commitShas.branchA, commitShas.branchB],
  message: "Merge rama-b into main",
  committedAt: "2026-11-13T14:30:00.000Z",
  // Estadísticas del merge respecto al primer padre (A).
  stats: { additions: 2, deletions: 0, total: 2 },
  // No se ejecutaron pruebas adicionales para este ejemplo de merge.
  metrics: null,
};

export const mainSyncMock: BranchSyncData = {
  schemaVersion: 1,
  mode: "incremental",
  repository: repositoryMock,
  branch: {
    name: "main",
    headSha: commitShas.initial,
    expectedHeadVersion: 0,
  },
  commits: [initialCommit],
  branchCommitShas: [commitShas.initial],
  executions: [initialExecution],
};

export const branchASyncMock: BranchSyncData = {
  schemaVersion: 1,
  mode: "incremental",
  repository: repositoryMock,
  branch: {
    name: "rama-a",
    headSha: commitShas.branchA,
    expectedHeadVersion: 0,
  },
  commits: [initialCommit, branchACommit],
  branchCommitShas: [commitShas.initial, commitShas.branchA],
  executions: [initialExecution, branchAExecution],
};

export const branchBSyncMock: BranchSyncData = {
  schemaVersion: 1,
  mode: "incremental",
  repository: repositoryMock,
  branch: {
    name: "rama-b",
    headSha: commitShas.branchB,
    expectedHeadVersion: 0,
  },
  commits: [initialCommit, branchBCommit],
  branchCommitShas: [commitShas.initial, commitShas.branchB],
  executions: [initialExecution, branchBExecution],
};

export const mainAfterMergeSyncMock: BranchSyncData = {
  schemaVersion: 1,
  mode: "incremental",
  repository: repositoryMock,
  branch: {
    name: "main",
    headSha: commitShas.merge,
    expectedHeadVersion: 1,
  },
  commits: [
    initialCommit,
    branchACommit,
    branchBCommit,
    mergeCommit,
  ],
  branchCommitShas: [
    commitShas.initial,
    commitShas.branchA,
    commitShas.branchB,
    commitShas.merge,
  ],
  executions: [
    initialExecution,
    branchAExecution,
    branchBExecution,
  ],
};

export const branchSyncMocks = {
  main: mainSyncMock,
  "rama-a": branchASyncMock,
  "rama-b": branchBSyncMock,
  "main-after-merge": mainAfterMergeSyncMock,
} satisfies Readonly<Record<string, BranchSyncData>>;
