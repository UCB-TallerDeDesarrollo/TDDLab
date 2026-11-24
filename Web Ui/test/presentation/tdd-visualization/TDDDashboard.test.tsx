import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type {
  CommitDataObject,
} from "../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type {
  CommitCycle,
} from "../../../src/modules/TDDCycles-Visualization/domain/TddCycleInterface";
import { TDDDashboard } from "../../../src/presentation/tdd-visualization/components/dashboard/TDDDashboard";
import {
  buildTDDChartData,
  buildTDDChartSummary,
  buildTDDDashboardViewModel,
} from "../../../src/presentation/tdd-visualization/services/tddDashboardMapper";
import type {
  TDDDashboardViewState,
} from "../../../src/presentation/tdd-visualization/types/tddVisualization.types";
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

function makeState(
  logs = dashboardTDDLogs,
  selectBranch = jest.fn(),
): TDDDashboardViewState {
  const commits: DashboardCommit[] = [
    makeCommit("sha-main-1", 30, "main"),
    makeCommit("sha-main-2", 60, "main"),
    makeCommit("sha-login", 80, "feature/login"),
  ];
  const branches = buildTDDDashboardViewModel(
    commits,
    [] as CommitCycle[],
    logs,
  );
  const selectedBranch = branches[0];

  return {
    branches,
    selectedBranch,
    selectedBranchName: selectedBranch.name,
    selectBranch,
    chartData: buildTDDChartData(selectedBranch),
    summary: buildTDDChartSummary(selectedBranch),
    hasExecutions: logs.length > 0,
  };
}

describe("TDDDashboard", () => {
  it("muestra lista de ramas, chart y resumen, sin el grafo", () => {
    const { container } = render(<TDDDashboard state={makeState()} />);

    expect(
      screen.getByRole("heading", { name: "Ramas del repositorio" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ciclo de ejecución de pruebas TDD" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("tdd-selected-branch")).toHaveTextContent("main");
    expect(
      screen.getAllByRole("button", { name: /feature\/login/ })[0],
    ).toBeInTheDocument();
    expect(
      container.querySelector(".tdd-dashboard__branch-list"),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".tdd-dashboard__git-graph"),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Historial de commits" })).not.toBeInTheDocument();
    expect(screen.getByTestId("tdd-summary-executions")).toHaveTextContent("4");
    expect(screen.getByTestId("tdd-summary-passed")).toHaveTextContent("2");
    expect(screen.getByTestId("tdd-summary-failed")).toHaveTextContent("2");
  });

  it("notifica la rama seleccionada desde la lista", () => {
    const selectBranch = jest.fn();
    render(<TDDDashboard state={makeState(dashboardTDDLogs, selectBranch)} />);

    fireEvent.click(
      screen.getAllByRole("button", { name: /feature\/login/ })[0],
    );
    expect(selectBranch).toHaveBeenCalledWith("feature/login");
    expect(selectBranch).toHaveBeenCalledTimes(1);
  });

  it("muestra el empty state cuando la rama no tiene ejecuciones", () => {
    render(<TDDDashboard state={makeState([])} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      /^No se tiene ejecución de pruebas$/,
    );
    expect(screen.queryByTestId("tdd-summary-executions")).not.toBeInTheDocument();
  });

  it("muestra el empty state cuando no hay commits", () => {
    const state = makeState([]);
    render(
      <TDDDashboard
        state={{
          ...state,
          branches: [],
          selectedBranch: null,
          selectedBranchName: null,
          chartData: [],
          hasExecutions: false,
        }}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      /^No hay datos del repositorio\.$/,
    );
  });
});
