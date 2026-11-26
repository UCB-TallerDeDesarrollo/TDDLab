
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import type { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

import type { TestExecutionDataBranchSupport } from "../../../modules/TDDCycles-Visualization/domain/ITestExecutionDataBranchSupport";

import { CommitHistoryAdapterBranchSupport } from "../../../modules/TDDCycles-Visualization/repository/CommitHistoryAdapterBranchSupport";

import { GetTestExecutionsBranchSupport } from "../../../modules/TDDCycles-Visualization/application/GetTestExecutionsBranchSupport";
import { ChartSymbolMark } from "./TDDCycleChart";
import { chartSymbols } from "./chartSymbols";

interface BranchTestCycleChartProps {
  commits: CommitDataObject[];
  selectedBranch?: string;
}

const repository = new CommitHistoryAdapterBranchSupport();

function conclusionColor(conclusion: string): string {
  switch (conclusion) {
    case "success":
      return "#16a34a";
    case "failure":
      return "#dc2626";
    case "cancelled":
      return "#f59e0b";
    case "error":
      return "#7c3aed";
    default:
      return "#94a3b8";
  }
}

function conclusionLabel(conclusion: string): string {
  switch (conclusion) {
    case "success":
      return "Exitosa";
    case "failure":
      return "Fallida";
    case "cancelled":
      return "Cancelada";
    case "error":
      return "Con error";
    default:
      return "Desconocida";
  }
}

function BranchTestCycleChart({
  commits,
  selectedBranch = "",
}: Readonly<BranchTestCycleChartProps>) {
  const [params] = useSearchParams();

  const owner = params.get("repoOwner") ?? "";
  const repoName = params.get("repoName") ?? "";

  const [executions, setExecutions] =
    useState<TestExecutionDataBranchSupport[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderedCommits = useMemo(
    () =>
      [...commits].sort(
        (a, b) =>
          new Date(a.commit.date).getTime() -
          new Date(b.commit.date).getTime()
      ),
    [commits]
  );

  useEffect(() => {
    let active = true;

    async function load() {
      if (!owner || !repoName) {
        setExecutions([]);
        setError("No se identificó el repositorio.");
        return;
      }

      setLoading(true);
      setError(null);
      setExecutions([]);

      try {
        const useCase = new GetTestExecutionsBranchSupport(repository);

        const result = await useCase.execute(
          owner,
          repoName,
          selectedBranch || undefined
        );

        if (!active) return;

        setExecutions(result);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "No fue posible cargar las ejecuciones."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [owner, repoName, selectedBranch]);

  const executionsBySha = useMemo(() => {
    const map = new Map<string, TestExecutionDataBranchSupport[]>();

    for (const execution of executions) {
      if (!execution.commit_sha) continue;

      const list = map.get(execution.commit_sha) ?? [];
      list.push(execution);
      map.set(execution.commit_sha, list);
    }

    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(a.executed_at).getTime() -
          new Date(b.executed_at).getTime()
      );
    }

    return map;
  }, [executions]);

  const totalLinkedExecutions = orderedCommits.reduce(
    (total, commit) =>
      total + (executionsBySha.get(commit.sha)?.length ?? 0),
    0
  );

  const plotWidth = Math.max(760, orderedCommits.length * 110 + 100);
  const maxRuns = Math.max(
    7,
    ...orderedCommits.map(
      (commit) => executionsBySha.get(commit.sha)?.length ?? 0
    )
  );
  const plotLeft = 60;
  const plotRight = plotWidth - 24;
  const plotTop = 32;
  const rowHeight = 38;
  const plotBottom = plotTop + maxRuns * rowHeight;
  const plotHeight = plotBottom + 76;
  const xForCommit = (index: number) =>
    orderedCommits.length === 1
      ? (plotLeft + plotRight) / 2
      : plotLeft + (index * (plotRight - plotLeft)) / (orderedCommits.length - 1);

  const isMultiBranch = selectedBranch === "all";
  const branchLabel =
    selectedBranch === "all"
      ? "Todas las ramas"
      : selectedBranch || "Predeterminada";

  return (
    <Box sx={{ width: "100%", maxWidth: 1300, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Ciclo de ejecución de pruebas TDD
      </Typography>

      {isMultiBranch && <Typography color="text.secondary" sx={{ mb: 2 }}>
        Rama: {branchLabel}. Las ejecuciones se relacionan mediante
        el SHA del commit.
      </Typography>}

      {loading && (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <CircularProgress size={22} />
          <Typography>Cargando ejecuciones de pruebas...</Typography>
        </Stack>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && totalLinkedExecutions === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No existen ejecuciones de pruebas asociadas a los commits
          de la rama seleccionada.
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1, sm: 2 },
          overflowX: "auto",
          backgroundColor: "#ffffff",
          borderColor: isMultiBranch ? "#e2e8f0" : "transparent",
          borderRadius: isMultiBranch ? 1 : 0,
        }}
      >
        {isMultiBranch && <Stack direction="row" spacing={1} sx={{ mb: 3 }} useFlexGap flexWrap="wrap">
          <Chip
            label={`${orderedCommits.length} commits`}
            variant="outlined"
          />
          <Chip
            label={`${totalLinkedExecutions} ejecuciones vinculadas`}
            color={totalLinkedExecutions > 0 ? "primary" : "default"}
          />
        </Stack>}

        {orderedCommits.length === 0 ? (
          <Typography color="text.secondary">
            No hay commits para representar.
          </Typography>
        ) : (
          <Box sx={{ overflowX: "auto", mb: 2 }}>
            <svg
              width={plotWidth}
              height={plotHeight}
              viewBox={`0 0 ${plotWidth} ${plotHeight}`}
              role="img"
              aria-label="Ciclo de ejecución de pruebas TDD"
              style={{ display: "block", fontFamily: "Roboto, Arial, sans-serif" }}
            >
              {Array.from({ length: maxRuns + 1 }, (_, tick) => {
                const y = plotBottom - tick * rowHeight;
                return (
                  <g key={`cycle-tick-${tick}`}>
                    <line x1={plotLeft} y1={y} x2={plotRight} y2={y} stroke="#e0e0e0" />
                    <text x={plotLeft - 10} y={y + 4} fill="#666" fontSize="11" textAnchor="end">{tick}</text>
                  </g>
                );
              })}
              <line x1={plotLeft} y1={plotTop} x2={plotLeft} y2={plotBottom} stroke="#333" strokeWidth="1.5" />
              <line x1={plotLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} stroke="#333" strokeWidth="1.5" />
              <text x={16} y={(plotTop + plotBottom) / 2} fill="#666" fontSize="12" textAnchor="middle" transform={`rotate(-90 16 ${(plotTop + plotBottom) / 2})`}>Pruebas ejecutadas</text>
              <text x={(plotLeft + plotRight) / 2} y={plotHeight - 8} fill="#666" fontSize="12" textAnchor="middle">Commits</text>
              {orderedCommits.map((commit, commitIndex) => {
                const x = xForCommit(commitIndex);
                const runs = executionsBySha.get(commit.sha) ?? [];
                return (
                  <g key={commit.sha}>
                    <line x1={x} y1={plotTop} x2={x} y2={plotBottom} stroke="#f0f0f0" />
                    {runs.map((run, runIndex) => {
                      const y = plotBottom - (runIndex + 0.5) * rowHeight;
                      const color = conclusionColor(run.conclusion);
                      const symbol = run.conclusion === "success" ? chartSymbols.success : chartSymbols.failure;
                      return (
                        <Tooltip
                          key={run.id}
                          title={
                            <Box>
                              <Typography fontSize={12}>Ejecución {runIndex + 1}</Typography>
                              <Typography fontSize={12}>Resultado: {conclusionLabel(run.conclusion)}</Typography>
                              <Typography fontSize={12}>Pasadas: {run.passed_tests}</Typography>
                              <Typography fontSize={12}>Fallidas: {run.failed_tests}</Typography>
                              <Typography fontSize={12}>Cobertura: {run.coverage == null ? "No disponible" : `${run.coverage}%`}</Typography>
                              <Typography fontSize={12}>Fecha: {new Date(run.executed_at).toLocaleString()}</Typography>
                            </Box>
                          }
                          arrow
                        >
                          <g
                            role="img"
                            aria-label={run.conclusion === "success" ? "Ejecución exitosa" : run.conclusion === "failure" ? "Ejecución con fallos" : `Ejecución ${conclusionLabel(run.conclusion)}`}
                            style={{ cursor: "help" }}
                          >
                            <title>{`${conclusionLabel(run.conclusion)} — Commit ${commitIndex + 1}`}</title>
                            <ChartSymbolMark config={symbol} x={x} y={y} color={color} />
                          </g>
                        </Tooltip>
                      );
                    })}
                    <text x={x} y={plotBottom + 22} fill="#666" fontSize="10" textAnchor="end" transform={`rotate(-40 ${x} ${plotBottom + 22})`}>Commit {commitIndex + 1}</text>
                    <text x={x} y={plotBottom + 43} fill="#777" fontSize="9" textAnchor="middle">{commit.sha.substring(0, 7)}</text>
                  </g>
                );
              })}
            </svg>
          </Box>
        )}
      </Paper>

      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
        justifyContent={isMultiBranch ? "flex-start" : "center"}
        sx={{ mt: 2, p: isMultiBranch ? 0 : 1.5, backgroundColor: isMultiBranch ? "transparent" : "#f9f9f9", borderRadius: 1 }}
      >
        {!isMultiBranch && <Typography fontSize={14} fontWeight={600} sx={{ width: "100%", textAlign: "center" }}>Leyenda</Typography>}
        {(isMultiBranch ? [
          { label: "Exitosa", color: "#16a34a" },
          { label: "Fallida", color: "#dc2626" },
          { label: "Cancelada", color: "#f59e0b" },
          { label: "Con error", color: "#7c3aed" },
        ] : [
          { label: "Exitosa", color: "#2d8a2d" },
          { label: "Fallida", color: "#c72828" },
        ]).map((item) => (
          <Stack
            key={item.label}
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <svg
              width={chartSymbols.success.size}
              height={chartSymbols.success.size}
              viewBox={`0 0 ${chartSymbols.success.size} ${chartSymbols.success.size}`}
              aria-hidden="true"
            >
              <ChartSymbolMark
                config={item.label === "Exitosa" ? chartSymbols.success : chartSymbols.failure}
                x={chartSymbols.success.size / 2}
                y={chartSymbols.success.size / 2}
                color={item.color}
              />
            </svg>

            <Typography variant="caption">
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {!isMultiBranch && <Stack direction="row" justifyContent="space-around" flexWrap="wrap" gap={1} sx={{ mt: 2, p: 1.5, backgroundColor: "#f5f5f5", borderRadius: 1, color: "#666", fontSize: 14 }}>
        <span>Total de commits: {orderedCommits.length}</span>
        <span>Total de ejecuciones: {totalLinkedExecutions}</span>
      </Stack>}
    </Box>
  );
}

export default BranchTestCycleChart;
