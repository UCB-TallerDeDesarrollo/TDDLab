import { act, renderHook } from "@testing-library/react";
import type {
  CommitDataObject,
} from "../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type {
  CommitCycle,
} from "../../../src/modules/TDDCycles-Visualization/domain/TddCycleInterface";
import { useTDDDashboard } from "../../../src/presentation/tdd-visualization/hooks/useTDDDashboard";
import { dashboardTDDLogs } from "./fixtures/tddLogFixtures";

type DashboardCommit = CommitDataObject & { branch?: string };

function makeCommit(sha: string, timestamp: number, branch: string): DashboardCommit {
  return {
    html_url: `https://github.com/example/repo/commit/${sha}`,
    sha,
    branch,
    stats: { total: 1, additions: 1, deletions: 0 },
    commit: {
      date: new Date(timestamp),
      message: `commit ${sha}`,
      url: `https://api.github.com/repos/example/repo/git/commits/${sha}`,
      comment_count: 0,
    },
    coverage: 50,
    test_count: 1,
    conclusion: "success",
  };
}

const commits: DashboardCommit[] = [
  makeCommit("sha-login", 80, "feature/login"),
  makeCommit("sha-main-1", 30, "main"),
  makeCommit("sha-main-2", 60, "main"),
];

const cycles: CommitCycle[] = [];

describe("useTDDDashboard", () => {
  it("selecciona main por defecto y expone el chart y el resumen de esa rama", () => {
    const { result } = renderHook(() =>
      useTDDDashboard(commits, cycles, dashboardTDDLogs),
    );

    expect(result.current.selectedBranchName).toBe("main");
    expect(result.current.branches.map((branch) => branch.name)).toEqual([
      "main",
      "feature/login",
    ]);
    expect(result.current.chartData.map((point) => point.sha)).toEqual([
      "sha-main-1",
      "sha-main-2",
    ]);
    expect(result.current.summary).toEqual({
      totalCommits: 2,
      totalExecutions: 4,
      totalPassed: 2,
      totalFailed: 2,
    });
    expect(result.current.hasExecutions).toBe(true);
  });

  it("permite seleccionar otra rama", () => {
    const { result } = renderHook(() =>
      useTDDDashboard(commits, cycles, dashboardTDDLogs),
    );

    act(() => result.current.selectBranch("feature/login"));

    expect(result.current.selectedBranchName).toBe("feature/login");
    expect(result.current.chartData.map((point) => point.sha)).toEqual([
      "sha-login",
    ]);
    expect(result.current.summary.totalExecutions).toBe(1);
  });

  it("vuelve a una rama existente cuando desaparece la seleccionada", () => {
    const { result, rerender } = renderHook(
      ({ commitsInput }) =>
        useTDDDashboard(commitsInput, cycles, dashboardTDDLogs),
      { initialProps: { commitsInput: commits as CommitDataObject[] } },
    );

    act(() => result.current.selectBranch("feature/login"));
    expect(result.current.selectedBranchName).toBe("feature/login");

    const onlyMain = commits.filter((commit) => commit.branch === "main");
    rerender({ commitsInput: onlyMain as CommitDataObject[] });

    expect(result.current.selectedBranchName).toBe("main");
  });

  it("devuelve un estado vacío cuando no hay datos", () => {
    const { result } = renderHook(() => useTDDDashboard(null, null, null));

    expect(result.current.branches).toEqual([]);
    expect(result.current.selectedBranch).toBeNull();
    expect(result.current.hasExecutions).toBe(false);
    expect(result.current.summary.totalExecutions).toBe(0);
  });
});
