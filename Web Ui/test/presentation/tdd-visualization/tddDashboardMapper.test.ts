import type {
  CommitDataObject,
} from "../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type {
  CommitCycle,
} from "../../../src/modules/TDDCycles-Visualization/domain/TddCycleInterface";
import {
  buildTDDChartData,
  buildTDDChartSummary,
  buildTDDDashboardViewModel,
  getBranchColor,
  groupExecutionsByCommit,
} from "../../../src/presentation/tdd-visualization/services/tddDashboardMapper";
import { dashboardTDDLogs } from "./fixtures/tddLogFixtures";

type DashboardCommit = CommitDataObject & {
  branch?: string;
  parent_sha?: string;
  author?: string;
};

function makeCommit(
  sha: string,
  timestamp: number,
  branch?: string,
  coverage = 50,
): DashboardCommit {
  return {
    html_url: `https://github.com/example/repo/commit/${sha}`,
    sha,
    branch,
    parent_sha: undefined,
    author: "test-user",
    stats: { total: 10, additions: 8, deletions: 2 },
    commit: {
      date: new Date(timestamp),
      message: `commit ${sha}`,
      url: `https://api.github.com/repos/example/repo/git/commits/${sha}`,
      comment_count: 0,
    },
    coverage,
    test_count: 3,
    conclusion: "success",
  };
}

const commits: DashboardCommit[] = [
  makeCommit("sha-login", 80, "feature/login", 84),
  makeCommit("sha-main-1", 30, "main", 70),
  makeCommit("sha-main-2", 60, "main", 78),
];

const cycles = [
  {
    url: "https://example.test/sha-main-2",
    sha: "sha-main-2",
    tddCycle: "RED -> GREEN -> COMMIT",
    coverage: 99,
  },
] as Array<CommitCycle & { coverage: number }>;

describe("tddDashboardMapper", () => {
  it("agrupa ejecuciones hasta el marcador de commit que las cierra", () => {
    const grouped = groupExecutionsByCommit(dashboardTDDLogs);

    expect(grouped.get("sha-main-1")).toHaveLength(2);
    expect(grouped.get("sha-main-2")).toHaveLength(2);
    expect(grouped.get("sha-login")).toHaveLength(1);
    expect(grouped.get("sha-main-1")?.[0].testId).toBe(101);
  });

  it("ubica main primero y toma la cobertura del ciclo cuando existe", () => {
    const branches = buildTDDDashboardViewModel(commits, cycles, dashboardTDDLogs);

    expect(branches.map((branch) => branch.name)).toEqual([
      "main",
      "feature/login",
    ]);
    expect(branches[0].color).toBe(getBranchColor("main"));
    expect(branches[1].color).toBe("#8b5cf6");
    expect(branches[0].commits[1].coverage).toBe(99);
    expect(branches[0].commits[1].tddCycle).toBe("RED -> GREEN -> COMMIT");
    expect(branches[0].executionCount).toBe(4);
    expect(branches[1].executionCount).toBe(1);
  });

  it("usa main como rama por defecto para commits sin branch", () => {
    const legacyCommits = [makeCommit("legacy-sha", 123, undefined, 60)];
    const branches = buildTDDDashboardViewModel(legacyCommits, [], []);

    expect(branches).toHaveLength(1);
    expect(branches[0].name).toBe("main");
  });

  it("ordena los commits del chart por timestamp y construye el detalle del tooltip", () => {
    const branches = buildTDDDashboardViewModel(commits, cycles, dashboardTDDLogs);
    const chartData = buildTDDChartData(branches[0]);

    expect(chartData.map((point) => point.sha)).toEqual([
      "sha-main-1",
      "sha-main-2",
    ]);
    expect(chartData.map((point) => point.commitNumber)).toEqual([1, 2]);
    expect(chartData[0].tests[0].passed).toBe(false);
    expect(chartData[0].tests[1].passed).toBe(true);
    expect(chartData[0].tests[1].detail).toBe(
      "Ejecución exitosa: 3 pruebas exitosas, 0 fallidas de 3. Commit: sha-main-1.",
    );
  });

  it("resume commits, ejecuciones, exitosas y fallidas de la rama", () => {
    const branches = buildTDDDashboardViewModel(commits, cycles, dashboardTDDLogs);
    const summary = buildTDDChartSummary(branches[0]);

    expect(summary).toEqual({
      totalCommits: 2,
      totalExecutions: 4,
      totalPassed: 2,
      totalFailed: 2,
    });
  });
});
