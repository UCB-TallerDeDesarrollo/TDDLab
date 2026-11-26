
import { useMemo, useRef } from "react";
import type { MouseEvent } from "react";

import {
  Line,
  Pie,
  getElementAtEvent,
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BubbleController,
  LineController,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import type { ChartData, ChartOptions } from "chart.js";

import { Alert, Box, Typography } from "@mui/material";

import type { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import type { CommitCycle } from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";
import type { TDDLogEntry } from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";

import TDDBoard from "./TDDBoard";
import TDDList from "./TDDList";
import GitTopologyChart from "./GitTopologyChart";
import BranchTestCycleChart from "./BranchTestCycleChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BubbleController,
  LineController,
  PieController,
  ArcElement,
  Tooltip,
  Legend
);

interface TDDLineChartProps {
  filteredCommitsObject: CommitDataObject[] | null;
  tddLogs: TDDLogEntry[] | null;
  optionSelected: string;
  port: CommitHistoryRepository;
  role: string;
  commitsCycles: CommitCycle[] | null;
  selectedBranch?: string;
  onMetricChange?: (metric: string) => void;
}

function hasTestData(commit: CommitDataObject): boolean {
  return (
    commit.conclusion !== "unknown" &&
    commit.conclusion !== "" &&
    commit.conclusion != null
  );
}

function getCommitColor(commit: CommitDataObject): string {
  if (!hasTestData(commit) || commit.coverage == null) return "#111111";

  if (
    commit.conclusion === "failure" ||
    commit.conclusion === "error" ||
    commit.conclusion === "cancelled" ||
    commit.test_count === 0
  ) {
    return "#dc2626";
  }

  const opacity =
    commit.coverage >= 90 ? 1 :
      commit.coverage >= 80 ? 0.8 :
        commit.coverage >= 70 ? 0.6 :
          commit.coverage >= 60 ? 0.4 : 0.2;

  return /\brefactor\w*\b/i.test(commit.commit.message)
    ? `rgba(0, 100, 255, ${opacity})`
    : `rgba(0, 110, 0, ${opacity})`;
}

function TDDLineCharts({
  filteredCommitsObject,
  tddLogs,
  optionSelected,
  port,
  role,
  selectedBranch = "",
  onMetricChange,
}: Readonly<TDDLineChartProps>) {
  const chartRef = useRef<ChartJS<"line"> | null>(null);

  const commits = useMemo(
    () =>
      [...(filteredCommitsObject ?? [])].sort(
        (a, b) =>
          new Date(a.commit.date).getTime() -
          new Date(b.commit.date).getTime()
      ),
    [filteredCommitsObject]
  );

  if (optionSelected === "Topología Git") {
    return <GitTopologyChart selectedBranch={selectedBranch} />;
  }

  if (optionSelected === "Lista") {
    return <TDDList commits={commits} />;
  }

  if (optionSelected === "Dashboard") {
    return (
      <TDDBoard
        commits={commits}
        tddLogs={tddLogs ?? undefined}
        port={port}
        role={role}
        selectedBranch={selectedBranch}
        onMetricChange={onMetricChange}
      />
    );
  }

  if (optionSelected === "Ciclo de ejecución de pruebas") {
    return (
      <BranchTestCycleChart
        commits={commits}
        selectedBranch={selectedBranch}
      />
    );
  }

  if (commits.length === 0) {
    return (
      <Alert severity="info">
        No se encontraron commits para la rama seleccionada.
      </Alert>
    );
  }

  if (optionSelected === "Complejidad") {
    return (
      <Box sx={{ overflowX: "auto" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Cambios por commit
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Este resumen muestra líneas modificadas; no representa
          complejidad ciclomática.
        </Typography>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              {[
                "SHA",
                "Mensaje",
                "Añadidas",
                "Eliminadas",
                "Total",
              ].map((header) => (
                <th
                  key={header}
                  style={{
                    padding: 12,
                    textAlign: "left",
                    borderBottom: "1px solid #cbd5e1",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {commits.map((commit) => (
              <tr key={commit.sha}>
                <td>{commit.sha.substring(0, 7)}</td>
                <td>{commit.commit.message}</td>
                <td>{commit.stats.additions}</td>
                <td>{commit.stats.deletions}</td>
                <td>{commit.stats.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  }

  if (optionSelected === "Pie") {
    const success = commits.filter(
      (commit) => commit.conclusion === "success"
    ).length;

    const failure = commits.filter(
      (commit) =>
        commit.conclusion === "failure" ||
        commit.conclusion === "error"
    ).length;

    const unknown = commits.length - success - failure;

    return (
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Distribución de commits por resultado
        </Typography>

        <Pie
          data={{
            labels: [
              "Exitosos",
              "Fallidos o con error",
              "Sin resultado u otros",
            ],
            datasets: [
              {
                data: [success, failure, unknown],
                backgroundColor: [
                  "#16a34a",
                  "#dc2626",
                  "#94a3b8",
                ],
              },
            ],
          }}
        />
      </Box>
    );
  }

  let label = "";
  let axisLabel = "";
  let dataTestId = "";
  let values: Array<number | null> = [];

  switch (optionSelected) {
    case "Cobertura de Código":
      label = "Cobertura de Código";
      axisLabel = "Cobertura (%)";
      dataTestId = "graph-coverage";

      values = commits.map(
        (commit) => commit.coverage ?? null
      );
      break;

    case "Total Número de Tests":
      label = "Total Número de Tests";
      axisLabel = "Cantidad de pruebas";
      dataTestId = "graph-testCount";

      values = commits.map((commit) =>
        hasTestData(commit) ? commit.test_count : null
      );
      break;

    case "Líneas de Código Modificadas":
      label = "Líneas de Código Modificadas";
      axisLabel = "Líneas modificadas";
      dataTestId = "graph-linesModified";

      values = commits.map(
        (commit) => commit.stats.total
      );
      break;

    default:
      return (
        <Alert severity="warning">
          No se reconoce la métrica seleccionada.
        </Alert>
      );
  }

  if (values.every((value) => value === null)) {
    return (
      <Alert severity="info">
        No existen datos disponibles para representar
        esta métrica.
      </Alert>
    );
  }

  const chartData: ChartData<
    "line",
    Array<number | null>,
    string
  > = {
    labels: commits.map((_, index) => `Commit ${index + 1}`),

    datasets: [
      {
        label,
        data: values,
        borderColor: "rgba(0, 0, 0, 0.16)",
        pointBackgroundColor: commits.map(getCommitColor),
        backgroundColor: commits.map(getCommitColor),
        pointRadius: 9,
        pointHoverRadius: 12,
        tension: 0.2,
        spanGaps: false,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.2,

    scales: {
      x: {
        grid: { color: "rgba(0, 0, 0, 0.07)" },
        title: {
          display: true,
          text: "Commits Realizados",
        },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.08)" },
        title: {
          display: true,
          text: axisLabel,
        },
      },
    },

    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          title: (items) => {
            const commit = commits[items[0]?.dataIndex ?? -1];
            return commit?.commit.message ?? "";
          },

          afterBody: (items) => {
            const commit = commits[items[0]?.dataIndex ?? -1];

            if (!commit) return [];

            return [
              `SHA: ${commit.sha.substring(0, 7)}`,
              `Líneas añadidas: ${commit.stats.additions}`,
              `Líneas eliminadas: ${commit.stats.deletions}`,
              `Líneas modificadas: ${commit.stats.total}`,
              `Pruebas: ${
                hasTestData(commit)
                  ? commit.test_count
                  : "No disponible"
              }`,
              `Cobertura: ${
                commit.coverage == null
                  ? "No disponible"
                  : `${commit.coverage}%`
              }`,
            ];
          },
        },
      },
    },
  };

  const handleClick = (
    event: MouseEvent<HTMLCanvasElement>
  ) => {
    if (!chartRef.current) return;

    const elements = getElementAtEvent(
      chartRef.current,
      event
    );

    if (elements.length === 0) return;

    const commit = commits[elements[0].index];

    if (commit?.html_url) {
      window.open(
        commit.html_url,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <Line
      ref={chartRef}
      data={chartData}
      options={chartOptions}
      onClick={handleClick}
      data-testid={dataTestId}
    />
  );
}

export default TDDLineCharts;
