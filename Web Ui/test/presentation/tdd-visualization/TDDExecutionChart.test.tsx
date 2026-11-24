import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CHART_FAILURE_COLOR, CHART_SUCCESS_COLOR } from "../../../src/presentation/tdd-visualization/components/chartSymbols";
import { TDDExecutionChart } from "../../../src/presentation/tdd-visualization/components/dashboard/TDDExecutionChart";
import {
  buildTDDChartData,
  buildTDDDashboardViewModel,
} from "../../../src/presentation/tdd-visualization/services/tddDashboardMapper";
import type {
  TDDChartPoint,
} from "../../../src/presentation/tdd-visualization/types/tddVisualization.types";
import type {
  CommitDataObject,
} from "../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { dashboardTDDLogs } from "./fixtures/tddLogFixtures";

type DashboardCommit = CommitDataObject & { branch?: string };

function chartData(): TDDChartPoint[] {
  const commits: DashboardCommit[] = [
    {
      html_url: "https://github.com/example/repo/commit/sha-main-1",
      sha: "sha-main-1",
      branch: "main",
      stats: { total: 1, additions: 1, deletions: 0 },
      commit: {
        date: new Date(30),
        message: "primer commit",
        url: "https://api.github.com/repos/example/repo/git/commits/sha-main-1",
        comment_count: 0,
      },
      coverage: 50,
      test_count: 3,
      conclusion: "success",
    },
  ];
  const branches = buildTDDDashboardViewModel(commits, [], dashboardTDDLogs);
  return buildTDDChartData(branches[0]);
}

describe("TDDExecutionChart", () => {
  it("dibuja marcadores exitosos y fallidos con sus colores", () => {
    const { container } = render(
      <TDDExecutionChart data={chartData()} branchName="main" />,
    );

    const markers = screen.getAllByRole("img", { name: /Ejecución/ });
    expect(markers).toHaveLength(2);
    expect(container.querySelector(`circle[fill="${CHART_FAILURE_COLOR}"]`)).toBeInTheDocument();
    expect(container.querySelector(`circle[fill="${CHART_SUCCESS_COLOR}"]`)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Ejecuciones TDD de main/ })).toBeInTheDocument();
  });

  it("muestra el tooltip con el detalle al pasar el cursor y al enfocar", () => {
    render(<TDDExecutionChart data={chartData()} branchName="main" />);
    const marker = screen.getAllByRole("img", { name: /Ejecución/ })[1];

    fireEvent.mouseEnter(marker, { clientX: 120, clientY: 80 });
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Ejecución exitosa: 3 pruebas exitosas, 0 fallidas de 3. Commit: sha-main-1.",
    );

    fireEvent.mouseLeave(marker);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.focus(marker);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("muestra el empty state cuando no hay ejecuciones", () => {
    render(<TDDExecutionChart data={[]} branchName="main" />);

    expect(screen.getByRole("status")).toHaveTextContent(
      /^No se tiene ejecución de pruebas$/,
    );
  });
});
