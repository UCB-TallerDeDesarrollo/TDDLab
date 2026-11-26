
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
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

import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

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

type BubblePoint = {
  x: number;
  y: number;
  r: number;
};

const repository = new CommitHistoryAdapterBranchSupport();

function hasTestData(commit: CommitDataObject): boolean {
  return (
    commit.conclusion !== "unknown" &&
    commit.conclusion !== "" &&
    commit.conclusion != null
  );
}

function getCommitColor(commit: CommitDataObject, classic = false): string {
  if (classic) {
    if (commit.coverage == null) return "#111111";
    if (commit.conclusion === "failure" || commit.test_count === 0) return "#ff0000";
    const opacity = commit.coverage >= 90 ? 1 : commit.coverage >= 80 ? 0.8 : commit.coverage >= 70 ? 0.6 : commit.coverage >= 60 ? 0.4 : 0.2;
    return /\brefactor\w*\b/i.test(commit.commit.message)
      ? `rgba(0, 100, 255, ${opacity})`
      : `rgba(0, 110, 0, ${opacity})`;
  }
  if (!hasTestData(commit)) return "#94a3b8";

  if (
    commit.conclusion === "failure" ||
    commit.conclusion === "error" ||
    commit.conclusion === "cancelled"
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
  const isMultiBranch = selectedBranch === "all";
  const [searchParams] = useSearchParams();

  const owner = searchParams.get("repoOwner") ?? "";
  const repoName = searchParams.get("repoName") ?? "";

  const chartRef = useRef<ChartJS<"bubble"> | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [selectedCommit, setSelectedCommit] =
    useState<CommitDataObject | null>(null);

  const [executions, setExecutions] =
    useState<TestExecutionDataBranchSupport[]>([]);

  const [loadingExecutions, setLoadingExecutions] = useState(false);
  const [executionError, setExecutionError] =
    useState<string | null>(null);

  const orderedCommits = useMemo(
    () =>
      [...commits].sort(
        (a, b) =>
          new Date(a.commit.date).getTime() -
          new Date(b.commit.date).getTime()
      ),
    [commits]
  );

  const measuredCommits = useMemo(
    () =>
      orderedCommits
        .map((commit, index) => ({ commit, index }))
        .filter(({ commit }) => hasTestData(commit)),
    [orderedCommits]
  );

  const commitsWithoutTests =
    orderedCommits.length - measuredCommits.length;

  const latestMeasuredCommit =
    measuredCommits.length > 0
      ? measuredCommits[measuredCommits.length - 1].commit
      : null;

  const bubbleData: ChartData<"bubble", BubblePoint[], string> = {
    datasets: measuredCommits.map(({ commit, index }) => ({
      label: commit.sha.substring(0, 7),
      data: [
        {
          x: index + 1,
          y: commit.test_count,
          r: isMultiBranch
            ? Math.min(22, Math.max(7, Math.sqrt(Math.max(0, commit.stats.total)) + 6))
            : Math.max(10, commit.stats.total / 1.5),
        },
      ],
      backgroundColor: getCommitColor(commit, !isMultiBranch),
      borderColor: "#ffffff",
      borderWidth: 2,
    })),
  };

  const bubbleOptions: ChartOptions<"bubble"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        max: Math.max(2, orderedCommits.length + 1),
        title: {
          display: true,
          text: isMultiBranch ? "Commits en orden cronológico" : "Commits",
        },
        ticks: {
          stepSize: 1,
          callback: isMultiBranch
            ? undefined
            : (value) => Number.isInteger(Number(value)) ? `Commit ${value}` : "",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: isMultiBranch ? "Pruebas registradas" : "Total número de tests",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = measuredCommits[context.datasetIndex];
            if (!item) return "";

            const commit = item.commit;

            return [
              `SHA: ${commit.sha.substring(0, 7)}`,
              `Mensaje: ${commit.commit.message}`,
              `Pruebas: ${commit.test_count}`,
              `Cobertura: ${
                commit.coverage == null
                  ? "No disponible"
                  : `${commit.coverage}%`
              }`,
              `Resultado: ${commit.conclusion}`,
            ];
          },
        },
      },
    },
  };

  useEffect(() => {
    setOpenModal(false);
    setSelectedCommit(null);
    setExecutions([]);
    setExecutionError(null);
  }, [owner, repoName, selectedBranch, commits]);

  const handleBubbleClick = async (
    event: MouseEvent<HTMLCanvasElement>
  ) => {
    if (!chartRef.current || loadingExecutions) return;

    const elements = getElementAtEvent(chartRef.current, event);
    if (elements.length === 0) return;

    const item = measuredCommits[elements[0].datasetIndex];
    if (!item) return;

    const commit = item.commit;

    setSelectedCommit(commit);
    setExecutions([]);
    setExecutionError(null);
    setOpenModal(true);
    setLoadingExecutions(true);

    try {
      const useCase = new GetTestExecutionsBranchSupport(repository);

      const response = await useCase.execute(
        owner,
        repoName,
        selectedBranch || undefined,
        commit.sha
      );

      setExecutions(
        response.filter((execution) => execution.commit_sha === commit.sha)
      );
    } catch (error) {
      setExecutionError(
        error instanceof Error
          ? error.message
          : "No se pudieron consultar las ejecuciones."
      );
    } finally {
      setLoadingExecutions(false);
    }
  };

  const makeLineData = (
    label: string,
    values: Array<number | null>
  ): ChartData<"line", Array<number | null>, string> => ({
    labels: orderedCommits.map(
      (commit) => commit.sha.substring(0, 7)
    ),
    datasets: [
      {
        label,
        data: values,
        borderColor: "#c7c7c7",
        pointBackgroundColor: orderedCommits.map((commit) => getCommitColor(commit, !isMultiBranch)),
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.2,
        spanGaps: false,
      },
    ],
  });

  const miniChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.8,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.08)" },
      },
      x: {
        grid: { color: "rgba(0, 0, 0, 0.06)" },
        ticks: { maxRotation: 40, minRotation: 40, font: { size: 9 } },
      },
    },
  };

  const metrics = [
    {
      title: "Total Número de Tests",
      metric: "Total Número de Tests",
      values: orderedCommits.map((commit) =>
        hasTestData(commit) ? commit.test_count : null
      ),
    },
    {
      title: "Cobertura de Código (%)",
      metric: "Cobertura de Código",
      values: orderedCommits.map((commit) => commit.coverage ?? null),
    },
    {
      title: "Líneas de Código Modificadas",
      metric: "Líneas de Código Modificadas",
      values: orderedCommits.map((commit) => commit.stats.total),
    },
  ];

  return (
    <Box className="tdd-dashboard" sx={{ width: "100%", p: isMultiBranch ? 2 : 0 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {isMultiBranch ? "Dashboard TDD — BranchSupport" : "Métricas de Commits con Cobertura de Código"}
      </Typography>

      {isMultiBranch && <Stack
        direction="row"
        spacing={2}
        useFlexGap
        flexWrap="wrap"
        sx={{ mb: 3 }}
      >
        <Chip label={`Commits: ${orderedCommits.length}`} />
        <Chip label={`Con resultado de pruebas: ${measuredCommits.length}`} />
        <Chip label={`Sin datos de pruebas: ${commitsWithoutTests}`} />

        {latestMeasuredCommit?.coverage != null && (
          <Chip
            color="success"
            label={`Última cobertura disponible: ${latestMeasuredCommit.coverage}%`}
          />
        )}
      </Stack>}

      {commitsWithoutTests > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Hay {commitsWithoutTests} commits sin resultados de pruebas
          registrados. No se representan como cero pruebas.
        </Alert>
      )}

      {isMultiBranch && <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Ejecuciones de pruebas por commit
      </Typography>}

      {measuredCommits.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ p: 4, textAlign: "center", mb: 3 }}
        >
          <Typography variant="h6">
            No hay resultados de pruebas disponibles
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Se recuperaron {orderedCommits.length} commits, pero el
            repositorio no tiene ejecuciones asociadas en BranchSupport.
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Puedes consultar sus cambios y la topología Git sin
            interpretar la ausencia de datos como una falla de pruebas.
          </Typography>

          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => onMetricChange?.("Topología Git")}
            disabled={!onMetricChange}
          >
            Ver topología Git
          </Button>
        </Paper>
      ) : (
        <Box className={!isMultiBranch ? "tdd-dashboard-overview" : undefined} sx={{ height: isMultiBranch ? 360 : 420, width: "100%", mb: 3 }}>
          <Box className={!isMultiBranch ? "tdd-dashboard-chart" : undefined} sx={{ height: "100%", minWidth: 0 }}>
          <Bubble
            ref={chartRef}
            data={bubbleData}
            options={bubbleOptions}
            onClick={handleBubbleClick}
          />
          </Box>
          {!isMultiBranch && <Box className="tdd-dashboard-coverage">
            <strong>Cobertura</strong>
            <Box className="tdd-dashboard-scale">
              <Box className="tdd-dashboard-gradient" aria-hidden="true" />
              <Box className="tdd-dashboard-ticks"><span>100</span><span>75</span><span>50</span><span>25</span></Box>
            </Box>
          </Box>}
        </Box>
      )}

      <Box className="tdd-dashboard-metrics">
        {metrics.map((item) => (
          <Paper
            key={item.metric}
            variant="outlined"
            sx={{ p: 1.5, minWidth: 0, borderColor: "#dddddd", borderRadius: 1 }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              {item.title}
            </Typography>

            {item.values.every((value) => value === null) ? (
              <Alert severity="info">
                No hay datos disponibles para esta métrica.
              </Alert>
            ) : (
              <Line
                data={makeLineData(item.title, item.values)}
                options={miniChartOptions}
              />
            )}

            {onMetricChange && (
              <Button
                size="small"
                sx={{ mt: 2 }}
                onClick={() => onMetricChange(item.metric)}
              >
                Ver detalle
              </Button>
            )}
          </Paper>
        ))}
      </Box>

      <Box sx={{ mt: 4 }}>
        <BranchTestCycleChart
          commits={orderedCommits}
          selectedBranch={selectedBranch}
        />
      </Box>

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
