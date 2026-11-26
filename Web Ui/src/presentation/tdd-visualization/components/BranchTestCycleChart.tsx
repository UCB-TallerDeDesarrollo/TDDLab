
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

  const branchLabel =
    selectedBranch === "all"
      ? "Todas las ramas"
      : selectedBranch || "Predeterminada";

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Ciclo de ejecución de pruebas TDD
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Rama: {branchLabel}. Las ejecuciones se relacionan mediante
        el SHA del commit.
      </Typography>

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
          p: 3,
          overflowX: "auto",
          backgroundColor: "#ffffff",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ mb: 3 }} useFlexGap flexWrap="wrap">
          <Chip
            label={`${orderedCommits.length} commits`}
            variant="outlined"
          />
          <Chip
            label={`${totalLinkedExecutions} ejecuciones vinculadas`}
            color={totalLinkedExecutions > 0 ? "primary" : "default"}
          />
        </Stack>

        {orderedCommits.length === 0 ? (
          <Typography color="text.secondary">
            No hay commits para representar.
          </Typography>
        ) : (
          <Box sx={{ minWidth: 560 }}>
            {orderedCommits.map((commit, index) => {
              const runs = executionsBySha.get(commit.sha) ?? [];

              return (
                <Box
                  key={commit.sha}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "115px 1fr",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight={600} fontSize={13}>
                      Commit {index + 1}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      fontSize={12}
                    >
                      {commit.sha.substring(0, 7)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      minHeight: 52,
                      borderLeft: "3px solid #94a3b8",
                      borderBottom: "1px solid #e2e8f0",
                      pl: 2,
                      py: 1,
                    }}
                  >
                    {runs.length === 0 ? (
                      <Typography
                        fontSize={13}
                        color="text.secondary"
                      >
                        Sin ejecuciones registradas
                      </Typography>
                    ) : (
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                        alignItems="center"
                      >
                        {runs.map((run, runIndex) => (
                          <Tooltip
                            key={run.id}
                            title={
                              <Box>
                                <Typography fontSize={12}>
                                  Ejecución {runIndex + 1}
                                </Typography>
                                <Typography fontSize={12}>
                                  Resultado: {conclusionLabel(run.conclusion)}
                                </Typography>
                                <Typography fontSize={12}>
                                  Pasadas: {run.passed_tests}
                                </Typography>
                                <Typography fontSize={12}>
                                  Fallidas: {run.failed_tests}
                                </Typography>
                                <Typography fontSize={12}>
                                  Cobertura: {run.coverage == null
                                    ? "No disponible"
                                    : `${run.coverage}%`}
                                </Typography>
                                <Typography fontSize={12}>
                                  Fecha: {new Date(run.executed_at).toLocaleString()}
                                </Typography>
                              </Box>
                            }
                            arrow
                          >
                            <Box
                              role="img"
                              aria-label={`Ejecución ${runIndex + 1}: ${conclusionLabel(run.conclusion)}`}
                              sx={{
                                width: 21,
                                height: 21,
                                borderRadius: "50%",
                                backgroundColor: conclusionColor(run.conclusion),
                                border: "2px solid white",
                                boxShadow: "0 0 0 1px #94a3b8",
                                cursor: "help",
                              }}
                            />
                          </Tooltip>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>

      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        flexWrap="wrap"
        sx={{ mt: 2 }}
      >
        {[
          { label: "Exitosa", color: "#16a34a" },
          { label: "Fallida", color: "#dc2626" },
          { label: "Cancelada", color: "#f59e0b" },
          { label: "Con error", color: "#7c3aed" },
        ].map((item) => (
          <Stack
            key={item.label}
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: item.color,
              }}
            />

            <Typography variant="caption">
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

export default BranchTestCycleChart;
