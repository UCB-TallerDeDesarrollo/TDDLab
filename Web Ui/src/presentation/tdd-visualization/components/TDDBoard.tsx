
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

function getCommitColor(commit: CommitDataObject): string {
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
          r: Math.min(
            22,
            Math.max(7, Math.sqrt(Math.max(0, commit.stats.total)) + 6)
          ),
        },
      ],
      backgroundColor: getCommitColor(commit),
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
          text: "Commits en orden cronológico",
        },
        ticks: {
          stepSize: 1,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Pruebas registradas",
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
        borderColor: "#2563eb",
        pointBackgroundColor: orderedCommits.map(getCommitColor),
        tension: 0.2,
        spanGaps: false,
      },
    ],
  });

  const miniChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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
    <Box sx={{ width: "100%", p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Dashboard TDD — BranchSupport
      </Typography>

      <Stack
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
      </Stack>

      {commitsWithoutTests > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Hay {commitsWithoutTests} commits sin resultados de pruebas
          registrados. No se representan como cero pruebas.
        </Alert>
      )}

      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Ejecuciones de pruebas por commit
      </Typography>

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
        <Box sx={{ height: 360, width: "100%", mb: 3 }}>
          <Bubble
            ref={chartRef}
            data={bubbleData}
            options={bubbleOptions}
            onClick={handleBubbleClick}
          />
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
          gap: 3,
          mt: 3,
        }}
      >
        {metrics.map((item) => (
          <Paper
            key={item.metric}
            variant="outlined"
            sx={{ p: 2, minWidth: 0 }}
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
