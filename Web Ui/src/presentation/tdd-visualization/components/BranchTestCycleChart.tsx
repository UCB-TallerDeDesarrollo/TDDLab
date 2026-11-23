import { useEffect, useMemo, useState } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useSearchParams } from "react-router-dom";

import type { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type { TestExecutionDataBranchSupport } from "../../../modules/TDDCycles-Visualization/domain/ITestExecutionDataBranchSupport";
import { CommitHistoryAdapterBranchSupport } from "../../../modules/TDDCycles-Visualization/repository/CommitHistoryAdapterBranchSupport";
import { GetTestExecutionsBranchSupport } from "../../../modules/TDDCycles-Visualization/application/GetTestExecutionsBranchSupport";

interface BranchTestCycleChartProps {
  commits: CommitDataObject[];
  selectedBranch?: string;
}

const repository = new CommitHistoryAdapterBranchSupport();
const LEFT = 75;
const TOP = 45;
const COLUMN_WIDTH = 90;
const ROW_HEIGHT = 43;

export default function BranchTestCycleChart({
  commits,
  selectedBranch = "",
}: Readonly<BranchTestCycleChartProps>) {
  const [searchParams] = useSearchParams();
  const owner = searchParams.get("repoOwner") ?? "";
  const repoName = searchParams.get("repoName") ?? "";

  const [executions, setExecutions] = useState<TestExecutionDataBranchSupport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setExecutions([]);
    setLoading(true);
    setError(null);

    if (!owner || !repoName) {
      setError("No se ha identificado el repositorio.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const useCase = new GetTestExecutionsBranchSupport(repository);
        const result = await useCase.execute(owner, repoName, selectedBranch || undefined);
        if (active) setExecutions(result);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar las ejecuciones.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [owner, repoName, selectedBranch]);

  const orderedCommits = useMemo(() =>
    [...commits].sort((a, b) =>
      new Date(a.commit.date).getTime() - new Date(b.commit.date).getTime()
    ), [commits]);

  const groupedExecutions = useMemo(() => {
    const map = new Map<string, TestExecutionDataBranchSupport[]>();
    orderedCommits.forEach((commit) => map.set(commit.sha, []));
    for (const execution of executions) {
      const sha = execution.commit_sha;
      if (sha && map.has(sha)) map.get(sha)!.push(execution);
    }
    for (const items of map.values()) {
      items.sort((a, b) => new Date(a.executed_at).getTime() - new Date(b.executed_at).getTime());
    }
    return map;
  }, [orderedCommits, executions]);

  const maxRuns = Math.max(1, ...Array.from(groupedExecutions.values(), (items) => items.length));
  const width = Math.max(700, LEFT * 2 + orderedCommits.length * COLUMN_WIDTH);
  const height = Math.max(250, TOP + (maxRuns + 1) * ROW_HEIGHT + 60);

  if (loading) return <Box sx={{ display: "flex", gap: 2, padding: 3 }}><CircularProgress size={25} /><Typography>Cargando ejecuciones de pruebas...</Typography></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!orderedCommits.length) return <Alert severity="info">No existen commits para la rama seleccionada.</Alert>;

  return (
    <Box sx={{ width: "100%", mt: 3 }} data-testid="branch-test-cycle-chart">
      <Typography variant="h6" gutterBottom>Ciclo de ejecución de pruebas TDD</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Rama: {selectedBranch || "Predeterminada"}. Cada punto corresponde a una ejecución asociada al SHA.
      </Typography>
      {!executions.length && <Alert severity="info" sx={{ mb: 2 }}>No existen ejecuciones registradas para esta rama.</Alert>}
      <Box sx={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 2, p: 1, backgroundColor: "#fff" }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Ejecuciones de pruebas por commit">
          <line x1={LEFT} y1={TOP} x2={LEFT} y2={height - 55} stroke="#475569" strokeWidth={2} />
          <line x1={LEFT} y1={height - 55} x2={width - 40} y2={height - 55} stroke="#475569" strokeWidth={2} />
          {orderedCommits.map((commit, index) => {
            const x = LEFT + (index + 1) * COLUMN_WIDTH;
            const items = groupedExecutions.get(commit.sha) ?? [];
            return (
              <g key={commit.sha}>
                <text x={x} y={height - 28} fontSize="11" textAnchor="middle" fill="#334155">{commit.sha.substring(0, 7)}</text>
                {items.map((execution, runIndex) => {
                  const y = height - 75 - runIndex * ROW_HEIGHT;
                  const success = execution.conclusion === "success";
                  return (
                    <g key={execution.id}>
                      <circle cx={x} cy={y} r={13} fill={success ? "#16a34a" : "#dc2626"} />
                      {success ? (
                        <path d={`M ${x - 6} ${y} l 4 4 l 8 -9`} stroke="#fff" strokeWidth={2.5} fill="none" strokeLinecap="round" />
                      ) : (
                        <path d={`M ${x - 5} ${y - 5} l 10 10 M ${x + 5} ${y - 5} l -10 10`} stroke="#fff" strokeWidth={2.5} fill="none" strokeLinecap="round" />
                      )}
                      <title>{`SHA: ${commit.sha}\nResultado: ${execution.conclusion}\nAprobadas: ${execution.passed_tests}\nFallidas: ${execution.failed_tests}\nTotal: ${execution.total_tests}`}</title>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
        Verde: ejecución exitosa. Rojo: fallida, cancelada o con error.
      </Typography>
    </Box>
  );
}
