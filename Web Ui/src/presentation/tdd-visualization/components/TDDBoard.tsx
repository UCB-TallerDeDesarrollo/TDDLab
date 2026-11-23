import { useEffect, useMemo, useRef, useState } from "react";
import { Bubble, Line, getElementAtEvent } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BubbleController,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Alert, Box, Typography } from "@mui/material";
import { useSearchParams } from "react-router-dom";

import type { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import type { TDDLogEntry } from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import type { TestExecutionDataBranchSupport } from "../../../modules/TDDCycles-Visualization/domain/ITestExecutionDataBranchSupport";

import { CommitHistoryAdapterBranchSupport } from "../../../modules/TDDCycles-Visualization/repository/CommitHistoryAdapterBranchSupport";
import { GetTestExecutionsBranchSupport } from "../../../modules/TDDCycles-Visualization/application/GetTestExecutionsBranchSupport";
import CommitTimelineDialog from "./TDDCommitTimelineDialog";
import BranchTestCycleChart from "./BranchTestCycleChart";

ChartJS.register(
  BubbleController,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface TDDBoardProps {
  commits: CommitDataObject[];
  tddLogs?: TDDLogEntry[];
  port?: CommitHistoryRepository;
  role?: string;
  selectedBranch?: string;
  onMetricChange?: (metric: string) => void;
}

const branchRepository = new CommitHistoryAdapterBranchSupport();

type BubblePoint = {
  x: number;
  y: number;
  r: number;
};

function commitColor(commit: CommitDataObject): string {
  if (commit.conclusion === "unknown" || commit.coverage == null) return "#64748b";

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

function TDDBoard({
  commits,
  selectedBranch = "",
  onMetricChange,
}: Readonly<TDDBoardProps>) {
  const [searchParams] = useSearchParams();

  const owner = searchParams.get("repoOwner") ?? "";
  const repoName = searchParams.get("repoName") ?? "";

  const bubbleRef = useRef<ChartJS<"bubble"> | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [selectedCommit, setSelectedCommit] =
    useState<CommitDataObject | null>(null);

  const [executions, setExecutions] =
    useState<TestExecutionDataBranchSupport[]>([]);

  const [loadingExecutions, setLoadingExecutions] =
    useState(false);

  const [executionError, setExecutionError] =
    useState<string | null>(null);

  // Los datos recibidos ya pertenecen a la rama
  // seleccionada. No volvemos a filtrarlos por índice.
  const orderedCommits = useMemo(
    () =>
      [...commits].sort(
        (a, b) =>
          new Date(a.commit.date).getTime() -
          new Date(b.commit.date).getTime()
      ),
    [commits]
  );

  const bubbleData = useMemo<
    ChartData<"bubble", BubblePoint[], string>
  >(
    () => ({
      datasets: orderedCommits.map((commit, index) => ({
        label: `Commit ${index + 1}`,
        data: [
          {
            x: index + 1,
            y: commit.test_count ?? 0,
            r: Math.max(
              7,
              Math.min(28, (commit.stats.total ?? 0) / 2)
            ),
          },
        ],
        backgroundColor: commitColor(commit),
        borderColor: "#ffffff",
        borderWidth: 2,
      })),
    }),
    [orderedCommits]
  );

  const bubbleOptions: ChartOptions<"bubble"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        title: {
          display: true,
          text: "Commits",
        },
        ticks: { stepSize: 1 },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Número de pruebas",
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const commit =
              orderedCommits[context.datasetIndex];

            if (!commit) return "";

            return [
              `SHA: ${commit.sha.substring(0, 7)}`,
              `Mensaje: ${commit.commit.message}`,
              `Cobertura: ${
                commit.conclusion === "unknown" || commit.coverage == null
                  ? "Sin datos"
                  : `${commit.coverage}%`
              }`,
              `Pruebas: ${commit.conclusion === "unknown" ? "Sin datos" : commit.test_count}`,
              `Cambios: ${commit.stats.total}`,
            ];
          },
        },
      },
    },
  };

  // Elimina los resultados de un commit anterior cuando
  // cambia el repositorio, la rama o la lista de commits.
  useEffect(() => {
    setOpenModal(false);
    setSelectedCommit(null);
    setExecutions([]);
    setExecutionError(null);
  }, [owner, repoName, selectedBranch, commits]);

  const handleBubbleClick = async (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => {
    if (!bubbleRef.current || loadingExecutions) return;

    const elements = getElementAtEvent(
      bubbleRef.current,
      event
    );

    if (!elements.length) return;

    // Cada dataset representa exactamente un commit.
    const commit =
      orderedCommits[elements[0].datasetIndex];

    if (!commit) return;

    setSelectedCommit(commit);
    setExecutions([]);
    setExecutionError(null);
    setOpenModal(true);
    setLoadingExecutions(true);

    try {
      const useCase = new GetTestExecutionsBranchSupport(
        branchRepository
      );

      const result = await useCase.execute(
        owner,
        repoName,
        selectedBranch || undefined,
        commit.sha
      );

      // Defensa adicional: nunca mostrar ejecuciones
      // de otro SHA si la API devuelve datos mezclados.
      const matching = result.filter(
        (execution) =>
          execution.commit_sha === commit.sha
      );

      setExecutions(matching);
    } catch (error) {
      console.error(
        "Error consultando ejecuciones por SHA:",
        error
      );

      setExecutionError(
        error instanceof Error
          ? error.message
          : "No se pudieron obtener las ejecuciones."
      );
    } finally {
      setLoadingExecutions(false);
    }
  };

  const selectMetric = (metric: string) => {
    // Ya no utilizamos window.location.reload().
    onMetricChange?.(metric);
  };

  const makeLineData = (
    label: string,
    getValue: (commit: CommitDataObject) => number | null
  ): ChartData<"line", Array<number | null>, string> => ({
    labels: orderedCommits.map(
      (_, index) => `Commit ${index + 1}`
    ),
    datasets: [
      {
        label,
        data: orderedCommits.map(getValue),
        borderColor: "#2563eb",
        pointBackgroundColor: orderedCommits.map(
          commitColor
        ),
        tension: 0.2,
      },
    ],
  });

  const smallChartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  const summaries = [
    {
      metric: "Total Número de Tests",
      title: "Total Número de Tests",
      data: makeLineData(
        "Pruebas",
        (commit) => commit.conclusion === "unknown" ? null : commit.test_count ?? 0
      ),
    },
    {
      metric: "Cobertura de Código",
      title: "Cobertura de Código",
      data: makeLineData(
        "Cobertura (%)",
        (commit) => commit.conclusion === "unknown" ? null : commit.coverage ?? null
      ),
    },
    {
      metric: "Líneas de Código Modificadas",
      title: "Líneas de Código Modificadas",
      data: makeLineData(
        "Líneas modificadas",
        (commit) => commit.stats.total ?? 0
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Dashboard TDD
      </Typography>

      {commits.some((commit) => commit.conclusion === "unknown") && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Algunos commits proceden de GitHub sin informes de pruebas o cobertura.
          Sus valores de pruebas y cobertura no están disponibles; las gráficas
          dejan esos puntos sin representar.
        </Alert>
      )}

      <Typography
        color="text.secondary"
        sx={{ marginBottom: 2 }}
      >
        Rama: {selectedBranch || "Predeterminada"}
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        Selecciona una burbuja para consultar las
        ejecuciones de pruebas asociadas a su SHA.
      </Typography>

      {orderedCommits.length === 0 ? (
        <Alert severity="info">
          No hay commits para mostrar.
        </Alert>
      ) : (
        <>
          <Box
            sx={{
              width: "100%",
              height: 410,
              minWidth: 300,
            }}
          >
            <Bubble
              ref={bubbleRef}
              data={bubbleData}
              options={bubbleOptions}
              onClick={handleBubbleClick}
              data-testid="branch-dashboard-bubble"
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 3,
              marginTop: 4,
            }}
          >
            {summaries.map((item) => (
              <Box
                key={item.metric}
                component="button"
                type="button"
                onClick={() => selectMetric(item.metric)}
                sx={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  padding: 2,
                  backgroundColor: "#fff",
                  cursor: onMetricChange
                    ? "pointer"
                    : "default",
                  textAlign: "left",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ marginBottom: 2 }}
                >
                  {item.title}
                </Typography>

                <Line
                  data={item.data}
                  options={smallChartOptions}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ marginTop: 4 }}>
            <BranchTestCycleChart
              commits={orderedCommits}
              selectedBranch={selectedBranch}
            />
          </Box>
        </>
      )}

      <CommitTimelineDialog
        open={openModal}
        handleCloseModal={() => {
          setOpenModal(false);
          setSelectedCommit(null);
        }}
        selectedCommit={selectedCommit}
        commitTimelineData={executions}
        loading={loadingExecutions}
        error={executionError}
      />
    </Box>
  );
}

export default TDDBoard;
