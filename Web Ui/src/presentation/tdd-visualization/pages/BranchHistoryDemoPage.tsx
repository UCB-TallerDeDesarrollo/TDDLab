import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import BranchHistoryChart from "../components/BranchHistoryChart";
import CommitHistoryMetricsChart from "../components/CommitHistoryMetricsChart";
import { branchHistoryMock } from "../mocks/branchHistoryMock";
import { CommitHistoryAdapter } from "../../../modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";
import type { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type {
  BranchHistories,
  BranchHistory,
} from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";

export default function BranchHistoryDemoPage() {
  const [history, setHistory] = useState<BranchHistories | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState("Total Número de Tests");
  const [liveCommits, setLiveCommits] = useState<CommitDataObject[] | null>(null);
  const [isLoadingLiveCommits, setIsLoadingLiveCommits] = useState(false);
  const [liveCommitsError, setLiveCommitsError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const owner = params.get("owner") ?? "equipo-tddlab";
    const repoName = params.get("repoName") ?? "ejemplo-sprint4";
    const selectedBranch = params.get("branch") ?? "rama-a";
    const branches = ["main", "rama-a", "rama-b"];

    let active = true;
    const adapter = new CommitHistoryAdapter();
    Promise.all(branches.map(branch => adapter.obtainBranchHistory(owner, repoName, branch)))
      .then((loadedBranches: BranchHistory[]) => {
        if (!active) return;
        const foundBranches = loadedBranches.filter(branch => branch != null);
        const orderedBranches = [
          ...foundBranches.filter(branch => branch.branch === selectedBranch),
          ...foundBranches.filter(branch => branch.branch !== selectedBranch),
        ];
        setHistory({
          repository: { provider: "github", owner, name: repoName },
          branches: orderedBranches,
        });
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        const message = loadError instanceof Error ? loadError.message : "No se pudo cargar el historial de ramas.";
        // Si el backend no responde, se usa el fixture de ejemplo para que la
        // gráfica siga siendo visible.
        setError(`${message} Se muestran datos de ejemplo.`);
        setHistory(branchHistoryMock);
      });

    return () => {
      active = false;
    };
  }, []);

  const loadLiveCommitHistory = () => {
    setIsLoadingLiveCommits(true);
    setLiveCommitsError(null);
    try {
      // La gráfica adicional se alimenta con los datos disponibles en la página.
      // Si el historial por ramas ya se cargó, se reutilizan sus commits; en caso
      // contrario se utiliza un conjunto de datos de ejemplo para que la gráfica
      // siempre pueda mostrarse.
      let commits: CommitDataObject[] = [];
      if (history) {
        const commitsBySha = new Map<string, (typeof history.branches)[number]["commits"][number]>();
        history.branches.forEach(branch => {
          branch.commits.forEach(commit => {
            if (!commitsBySha.has(commit.sha)) {
              commitsBySha.set(commit.sha, commit);
            }
          });
        });
        commits = Array.from(commitsBySha.values()).map(commit => ({
          html_url: "",
          sha: commit.sha,
          stats: commit.stats ?? { total: 0, additions: 0, deletions: 0 },
          commit: {
            date: commit.committedAt ?? new Date(),
            message: commit.message,
            url: "",
            comment_count: 0,
          },
          coverage: commit.metrics?.coveragePercentage ?? 0,
          test_count: commit.metrics?.numTotalTests ?? 0,
          conclusion: commit.metrics?.conclusion === "failure" ? "failure" : "success",
        }));
        commits.sort((a, b) => b.commit.date.getTime() - a.commit.date.getTime());
      }

      if (commits.length === 0) {
        commits = [
          {
            html_url: "",
            sha: "mock-commit-1",
            stats: { total: 5, additions: 3, deletions: 2 },
            commit: { date: new Date("2024-01-02"), message: "Commit de ejemplo 1", url: "", comment_count: 0 },
            coverage: 80,
            test_count: 3,
            conclusion: "success",
          },
          {
            html_url: "",
            sha: "mock-commit-2",
            stats: { total: 3, additions: 2, deletions: 1 },
            commit: { date: new Date("2024-01-01"), message: "Commit de ejemplo 2", url: "", comment_count: 0 },
            coverage: 60,
            test_count: 2,
            conclusion: "success",
          },
        ];
      }

      setLiveCommits(commits);
    } catch (loadError: unknown) {
      setLiveCommitsError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar la nueva gráfica.",
      );
    } finally {
      setIsLoadingLiveCommits(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#fff", padding: "28px 0 36px", fontFamily: "Inter, Segoe UI, sans-serif" }}>
      <h1 style={{ textAlign: "center", margin: "0 0 20px", fontSize: "30px", lineHeight: 1.2, color: "#111827", fontWeight: 800 }}>
        Tarea: TDDLabScriptTests
      </h1>
      <div style={{ width: "calc(100% - 70px)", maxWidth: 1450, margin: "0 auto 16px" }}>
        <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { height: 58, borderRadius: "8px", "& fieldset": { borderColor: "#2563EB", borderWidth: "2px" } } }}>
          <InputLabel id="branch-history-metric-label">Métricas</InputLabel>
          <Select
            labelId="branch-history-metric-label"
            value={metric}
            label="Métricas"
            onChange={event => setMetric(event.target.value)}
          >
            <MenuItem value="Total Número de Tests">Total Número de Tests</MenuItem>
          </Select>
        </FormControl>
      </div>
      {error && (
        <p role="alert" style={{ maxWidth: 1200, margin: "30px auto", padding: "16px", color: "#b42318", background: "#fff1f0" }}>
          No se pudo cargar el historial: {error}
        </p>
      )}
      {!history && !error && (
        <div role="status" style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
          <CircularProgress />
        </div>
      )}
      {history && <BranchHistoryChart history={history} />}
      <div style={{ display: "flex", justifyContent: "center", margin: "22px auto 10px" }}>
        <button
          type="button"
          onClick={loadLiveCommitHistory}
          disabled={isLoadingLiveCommits}
          style={{
            border: 0,
            borderRadius: 8,
            padding: "12px 20px",
            background: isLoadingLiveCommits ? "#94A3B8" : "#2563EB",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: isLoadingLiveCommits ? "wait" : "pointer",
          }}
        >
          {isLoadingLiveCommits
            ? "Cargando datos reales..."
            : liveCommits
              ? "Actualizar gráfica con datos reales"
              : "Mostrar gráfica con datos reales"}
        </button>
      </div>
      {liveCommitsError && (
        <p role="alert" style={{ maxWidth: 1200, margin: "12px auto", padding: 16, color: "#b42318", background: "#fff1f0" }}>
          No se pudo cargar la nueva gráfica: {liveCommitsError}
        </p>
      )}
      {liveCommits && <CommitHistoryMetricsChart commits={liveCommits} />}
    </main>
  );
}
