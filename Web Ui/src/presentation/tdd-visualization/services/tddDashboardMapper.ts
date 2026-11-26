import type {
  CommitDataObject,
  BranchDTO,
} from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type { TddExecution } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type {
  CommitCycle,
} from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";
import type {
  CommitLog,
  TDDLogEntry,
  TestExecutionLog,
} from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import type {
  TDDChartPoint,
  TDDChartSummary,
  TDDCommitView,
  TDDExecutionView,
  TDDBranchView,
} from "../types/tddVisualization.types";

type DashboardCommitSource = CommitDataObject & {
  branch?: string;
  parent_sha?: string | null;
  author?: string;
  tddExecutions?: TddExecution[];
};

type DashboardCycleSource = CommitCycle & {
  coverage?: number;
};

const DEFAULT_BRANCH_COLOR = "#64748b";

const BRANCH_COLORS: Record<string, string> = {
  main: "#2878d0",
  "feature/login": "#8b5cf6",
  "feature/profile": "#e69a32",
  "fix/validation": "#16a36a",
};

const FALLBACK_BRANCH_NAME = "main";

export function isCommitLog(entry: TDDLogEntry): entry is CommitLog {
  return typeof (entry as CommitLog).commitId === "string";
}

export function isTestExecutionLog(entry: TDDLogEntry): entry is TestExecutionLog {
  return typeof (entry as TestExecutionLog).numPassedTests === "number";
}

export function getBranchColor(name: string): string {
  return BRANCH_COLORS[name] ?? DEFAULT_BRANCH_COLOR;
}

/**
 * Agrupa ejecuciones hasta encontrar el marcador de commit que las cierra.
 * Es el criterio usado por el prototipo `git-tdd-dashboard.html`.
 */
export function groupExecutionsByCommit(
  logs: TDDLogEntry[],
): Map<string, TestExecutionLog[]> {
  const grouped = new Map<string, TestExecutionLog[]>();
  let pending: TestExecutionLog[] = [];

  for (const entry of logs) {
    if (isCommitLog(entry)) {
      grouped.set(entry.commitId, pending);
      pending = [];
    } else if (isTestExecutionLog(entry)) {
      pending.push(entry);
    }
  }

  return grouped;
}

function toTimestamp(date: Date | string | number): number {
  if (date instanceof Date) {
    return date.getTime();
  }

  const parsed = new Date(date).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toExecutionView(
  execution: TestExecutionLog,
  commitSha: string,
): TDDExecutionView {
  const passed = execution.failedTests === 0 && execution.success === true;

  return {
    testId: execution.testId,
    timestamp: execution.timestamp,
    passed,
    passedTests: execution.numPassedTests,
    failedTests: execution.failedTests,
    totalTests: execution.numTotalTests,
    detail:
      `Ejecución ${passed ? "exitosa" : "con fallos"}: ` +
      `${execution.numPassedTests} pruebas exitosas, ` +
      `${execution.failedTests} fallidas de ${execution.numTotalTests}. ` +
      `Commit: ${commitSha}.`,
  };
}

function toExecutionViewFromBackendExecution(
  execution: TddExecution,
  commitSha: string,
  index: number,
): TDDExecutionView {
  const passed = execution.testsFailed === 0 && execution.testsTotal > 0;

  return {
    testId: index,
    timestamp: toTimestamp(execution.executedAt),
    passed,
    passedTests: execution.testsPassed,
    failedTests: execution.testsFailed,
    totalTests: execution.testsTotal,
    detail:
      `Ejecución ${passed ? "exitosa" : "con fallos"}: ` +
      `${execution.testsPassed} pruebas exitosas, ` +
      `${execution.testsFailed} fallidas de ${execution.testsTotal}. ` +
      `Commit: ${commitSha}.`,
  };
}

export function buildTDDDashboardViewModel(
  commits: CommitDataObject[],
  cycles: CommitCycle[],
  logs: TDDLogEntry[],
  branchesFromRepo?: BranchDTO[],
): TDDBranchView[] {
  const executionsBySha = groupExecutionsByCommit(logs);
  const branchesByName = new Map<string, TDDBranchView>();

  for (const commit of commits) {
    const source = commit as DashboardCommitSource;
    const branchName = source.branch ?? FALLBACK_BRANCH_NAME;

    if (!branchesByName.has(branchName)) {
      branchesByName.set(branchName, {
        name: branchName,
        color: getBranchColor(branchName),
        commits: [],
        executionCount: 0,
      });
    }

    const cycle = cycles.find((item) => item.sha === source.sha) as
      | DashboardCycleSource
      | undefined;
    const rawExecutions = executionsBySha.get(source.sha) ?? [];

    // Ejecuciones desde tddExecutions del backend (nuevo modelo de ramas)
    const backendExecutions = (source.tddExecutions ?? []).map((exec, idx) =>
      toExecutionViewFromBackendExecution(exec, source.sha, idx),
    );

    const executions = [
      ...rawExecutions.map((execution) =>
        toExecutionView(execution, source.sha),
      ),
      ...backendExecutions,
    ];

    const commitView: TDDCommitView = {
      sha: source.sha,
      parentSha: source.parent_sha ?? undefined,
      author: source.author,
      htmlUrl: source.html_url,
      message: source.commit.message,
      timestamp: toTimestamp(source.commit.date),
      coverage: cycle?.coverage ?? source.coverage,
      tddCycle: cycle?.tddCycle ?? null,
      executions,
    };

    branchesByName.get(branchName)?.commits.push(commitView);
  }

  // Agrega ramas del repositorio que no tienen commits aún, debajo de main.
  if (branchesFromRepo) {
    for (const branch of branchesFromRepo) {
      if (!branchesByName.has(branch.name)) {
        branchesByName.set(branch.name, {
          name: branch.name,
          color: getBranchColor(branch.name),
          commits: [],
          executionCount: 0,
        });
      }
    }
  }

  const branches = [...branchesByName.values()];

  for (const branch of branches) {
    branch.executionCount = branch.commits.reduce(
      (total, commit) => total + commit.executions.length,
      0,
    );
  }

  const main = branches.find((branch) => branch.name === "main");
  const others = branches.filter((branch) => branch.name !== "main");

  // `main` primero; el resto conserva el orden recibido desde la API.
  return [main, ...others].filter((branch): branch is TDDBranchView => Boolean(branch));
}

export function buildTDDChartData(branch: TDDBranchView): TDDChartPoint[] {
  return branch.commits
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((commit, index) => ({
      sha: commit.sha,
      commitNumber: index + 1,
      message: commit.message,
      tests: commit.executions,
    }));
}

export function createEmptyTDDChartSummary(): TDDChartSummary {
  return {
    totalCommits: 0,
    totalExecutions: 0,
    totalPassed: 0,
    totalFailed: 0,
  };
}

export function buildTDDChartSummary(branch: TDDBranchView): TDDChartSummary {
  const tests = branch.commits.flatMap((commit) => commit.executions);
  const totalPassed = tests.filter((test) => test.passed).length;

  return {
    totalCommits: branch.commits.length,
    totalExecutions: tests.length,
    totalPassed,
    totalFailed: tests.length - totalPassed,
  };
}
