import { useMemo, useRef } from "react";
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

import type {
  ChartData,
  ChartOptions,
} from "chart.js";

import type { MouseEvent } from "react";

import type {
  CommitDataObject,
} from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

import type {
  CommitHistoryRepository,
} from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";

import type {
  CommitCycle,
} from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";

import type {
  TDDLogEntry,
} from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";

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

interface LineChartProps {
  filteredCommitsObject: CommitDataObject[] | null;
  tddLogs: TDDLogEntry[] | null;
  optionSelected: string;
  port: CommitHistoryRepository;
  role: string;
  commitsCycles: CommitCycle[] | null;
  selectedBranch?: string;
  onMetricChange?: (metric: string) => void;
}

function getColor(commit: CommitDataObject): string {
  if (commit.conclusion === "unknown" || commit.coverage == null) {
    return "#64748b";
  }

  if (
    commit.conclusion === "failure" ||
    commit.conclusion === "error" ||
    commit.test_count === 0
  ) {
    return "#dc2626";
  }

  if (/\brefactor\w*\b/i.test(commit.commit.message)) {
    return "#2563eb";
  }

  return "#16a34a";
}

function TDDLineCharts({
  filteredCommitsObject,
  optionSelected,
  port,
  role,
  selectedBranch = "",
  onMetricChange,
}: Readonly<LineChartProps>) {

  const chartRef = useRef<ChartJS<"line"> | null>(null);

  // Orden único para puntos, etiquetas, colores,
  // fechas y enlaces de GitHub.
  const commits = useMemo(
    () =>
      [...(filteredCommitsObject ?? [])].sort(
        (a, b) =>
          new Date(a.commit.date).getTime() -
          new Date(b.commit.date).getTime()
      ),
    [filteredCommitsObject]
  );

  // Topología: la API devuelve todo el DAG.
  if (optionSelected === "Topología Git") {
    return (
      <GitTopologyChart
        selectedBranch={selectedBranch}
      />
    );
  }

  // Vista de commits ya filtrados por el hook.
  if (optionSelected === "Lista") {
    return <TDDList commits={commits} />;
  }

  // Dashboard con ejecuciones por SHA.
  if (optionSelected === "Dashboard") {
    return (
      <TDDBoard
        commits={commits}
        port={port}
        role={role}
        selectedBranch={selectedBranch}
        onMetricChange={onMetricChange}
      />
    );
  }

  // Ciclos TDD por rama desde PostgreSQL.
  if (
    optionSelected ===
    "Ciclo de ejecución de pruebas"
  ) {
    return (
      <BranchTestCycleChart
        commits={commits}
        selectedBranch={selectedBranch}
      />
    );
  }

  // Vista de complejidad basada en cambios del commit.
  // No equivale a complejidad ciclomática.
  if (optionSelected === "Complejidad") {
    return (
      <div style={{ overflowX: "auto", width: "100%" }}>
        <h2>Resumen de cambios por commit</h2>

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
                    borderBottom:
                      "1px solid #cbd5e1",
                    textAlign: "left",
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
      </div>
    );
  }

  if (optionSelected === "Pie") {
    const success = commits.filter(
      (commit) =>
        commit.conclusion === "success"
    ).length;

    const failure = commits.filter(
      (commit) =>
        commit.conclusion === "failure"
    ).length;

    const other = commits.length - success - failure;

    return (
      <div
        style={{
          width: "100%",
          maxWidth: 550,
          margin: "auto",
        }}
      >
        <h2>Distribución de commits</h2>

        <Pie
          data={{
            labels: [
              "Exitosos",
              "Fallidos",
              "Sin resultado u otros",
            ],
            datasets: [
              {
                data: [success, failure, other],
                backgroundColor: [
                  "#16a34a",
                  "#dc2626",
                  "#64748b",
                ],
              },
            ],
          }}
        />
      </div>
    );
  }

  let label = "";
  let axisText = "";
  let dataTestid = "";
  let values: Array<number | null> = [];

  switch (optionSelected) {
    case "Cobertura de Código":
      label = "Porcentaje de Cobertura de Código";
      axisText = "Cobertura (%)";
      dataTestid = "graph-coverage";

      values = commits.map(
        (commit) => commit.conclusion === "unknown" ? null : commit.coverage ?? null
      );
      break;

    case "Total Número de Tests":
      label = "Número total de pruebas";
      axisText = "Número de pruebas";
      dataTestid = "graph-testCount";

      values = commits.map(
        (commit) => commit.conclusion === "unknown" ? null : commit.test_count ?? 0
      );
      break;

    case "Líneas de Código Modificadas":
      label = "Líneas de código modificadas";
      axisText = "Líneas modificadas";
      dataTestid = "graph-linesModified";

      values = commits.map(
        (commit) => commit.stats.total ?? 0
      );
      break;

    default:
      return (
        <output>
          No se reconoce la métrica seleccionada.
        </output>
      );
  }

  const chartData: ChartData<
    "line",
    Array<number | null>,
    string
  > = {
    labels: commits.map(
      (_, index) => `Commit ${index + 1}`
    ),
    datasets: [
      {
        label,
        data: values,
        borderColor: "#2563eb",
        pointBackgroundColor: commits.map(getColor),
        backgroundColor: commits.map(getColor),
        tension: 0.2,
        pointRadius: 7,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: true,

    scales: {
      x: {
        title: {
          display: true,
          text: "Commits",
        },
      },

      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: axisText,
        },
      },
    },

    plugins: {
      tooltip: {
        callbacks: {
          title: (items) => {
            const index = items[0]?.dataIndex ?? -1;
            const commit = commits[index];

            if (!commit) return "";

            return `Commit ${index + 1}: ${
              commit.commit.message
            }`;
          },

          afterBody: (items) => {
            const index = items[0]?.dataIndex ?? -1;
            const commit = commits[index];

            if (!commit) return [];

            return [
              `SHA: ${commit.sha.substring(0, 7)}`,
              `Añadidas: ${commit.stats.additions}`,
              `Eliminadas: ${commit.stats.deletions}`,
              `Total: ${commit.stats.total}`,
              `Pruebas: ${commit.conclusion === "unknown" ? "Sin datos" : commit.test_count}`,
              `Cobertura: ${
                commit.conclusion === "unknown" || commit.coverage == null
                  ? "Sin datos"
                  : `${commit.coverage}%`
              }`,
              `Fecha: ${new Date(
                commit.commit.date
              ).toLocaleString()}`,
            ];
          },
        },
      },
    },
  };

  const handleClick = (
    event: MouseEvent<HTMLCanvasElement>
  ) => {
    const chart = chartRef.current;
    if (!chart) return;

    const elements = getElementAtEvent(chart, event);

    if (!elements.length) return;

    const commit = commits[elements[0].index];
    if (!commit?.html_url) return;

    window.open(
      commit.html_url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <Line
      ref={chartRef}
      data={chartData}
      options={options}
      height={100}
      onClick={handleClick}
      data-testid={dataTestid}
    />
  );
}

export default TDDLineCharts;
