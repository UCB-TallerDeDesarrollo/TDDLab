import { useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import { Bubble } from "react-chartjs-2";

import {
  Chart as ChartJS,
  BubbleController,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

import type {
  ChartData,
  ChartOptions,
} from "chart.js";

import type {
  CommitDataObject,
} from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

import type {
  TestExecutionDataBranchSupport,
} from "../../../modules/TDDCycles-Visualization/domain/ITestExecutionDataBranchSupport";

ChartJS.register(
  BubbleController,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

interface CommitTimelineDialogProps {
  open: boolean;
  handleCloseModal: () => void;
  selectedCommit: CommitDataObject | null;
  commitTimelineData: TestExecutionDataBranchSupport[];
  loading?: boolean;
  error?: string | null;
}

type TimelinePoint = {
  x: number;
  y: number;
  r: number;
};

function TDDCommitTimelineDialog({
  open,
  handleCloseModal,
  selectedCommit,
  commitTimelineData,
  loading = false,
  error = null,
}: Readonly<CommitTimelineDialogProps>) {

  const executions = useMemo(
    () =>
      [...commitTimelineData].sort(
        (a, b) =>
          new Date(a.executed_at).getTime() -
          new Date(b.executed_at).getTime()
      ),
    [commitTimelineData]
  );

  const chartData: ChartData<
    "bubble",
    TimelinePoint[],
    string
  > = {
    datasets: [
      {
        label: "Ejecuciones de pruebas",
        data: executions.map((_, index) => ({
          x: index + 1,
          y: 1,
          r: 14,
        })),
        backgroundColor: executions.map((item) =>
          item.conclusion === "success"
            ? "#16a34a"
            : "#dc2626"
        ),
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions: ChartOptions<"bubble"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        title: {
          display: true,
          text: "Número de ejecución",
        },
        ticks: { stepSize: 1 },
      },
      y: {
        min: 0,
        max: 2,
        ticks: { display: false },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = executions[context.dataIndex];
            if (!item) return "";

            const date = new Date(item.executed_at);

            return [
              `Ejecución: ${context.dataIndex + 1}`,
              `Origen: ${item.source}`,
              `Total: ${item.total_tests}`,
              `Aprobadas: ${item.passed_tests}`,
              `Fallidas: ${item.failed_tests}`,
              `Omitidas: ${item.skipped_tests}`,
              `Errores: ${item.error_tests}`,
              `Cobertura: ${
                item.coverage == null
                  ? "No disponible"
                  : `${item.coverage}%`
              }`,
              `Resultado: ${item.conclusion}`,
              `Fecha: ${
                Number.isNaN(date.getTime())
                  ? "No disponible"
                  : date.toLocaleString()
              }`,
            ];
          },
        },
      },
    },
  };

  const totalRuns = executions.length;

  const successfulRuns = executions.filter(
    (item) => item.conclusion === "success"
  ).length;

  const failedRuns = executions.filter(
    (item) => item.conclusion === "failure"
  ).length;

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      fullWidth
      maxWidth="md"
      aria-labelledby="branch-commit-dialog"
    >
      <DialogTitle id="branch-commit-dialog">
        Ejecuciones de pruebas del commit
      </DialogTitle>

      <DialogContent>
        {selectedCommit && (
          <Box sx={{ marginBottom: 3 }}>
            <Typography
              sx={{ fontFamily: "monospace" }}
            >
              SHA: {selectedCommit.sha}
            </Typography>

            <Typography sx={{ marginTop: 1 }}>
              {selectedCommit.commit.message}
            </Typography>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, minHeight: 170 }}>
            <CircularProgress size={26} />
            <Typography>Consultando ejecuciones del commit...</Typography>
          </Box>
        )}
        {!loading && error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && executions.length === 0 && (
          <Alert severity="info">No hay ejecuciones de pruebas registradas para este SHA.</Alert>
        )}
        {!loading && !error && executions.length > 0 && (
          <>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, marginBottom: 2 }}>
              <Typography>Total: {totalRuns}</Typography>
              <Typography color="success.main">Exitosas: {successfulRuns}</Typography>
              <Typography color="error.main">Fallidas: {failedRuns}</Typography>
              <Typography>Otras: {totalRuns - successfulRuns - failedRuns}</Typography>
            </Box>
            <Box sx={{ height: 270 }}>
              <Bubble data={chartData} options={chartOptions} data-testid="commit-executions-chart" />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCloseModal}>
          Cerrar
        </Button>

        <Button
          variant="contained"
          disabled={!selectedCommit?.html_url}
          onClick={() => {
            if (selectedCommit?.html_url) {
              window.open(
                selectedCommit.html_url,
                "_blank",
                "noopener,noreferrer"
              );
            }
          }}
        >
          Ver en GitHub
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TDDCommitTimelineDialog;
