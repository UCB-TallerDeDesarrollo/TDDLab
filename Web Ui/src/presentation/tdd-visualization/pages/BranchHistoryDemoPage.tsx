import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import BranchHistoryChart from "../components/BranchHistoryChart";
import { CommitHistoryAdapter } from "../../../modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";
import type {
  BranchHistories,
  BranchHistory,
} from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";

export default function BranchHistoryDemoPage() {
  const [history, setHistory] = useState<BranchHistories | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState("Total Número de Tests");

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
        setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el historial de ramas.");
      });

    return () => {
      active = false;
    };
  }, []);

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
    </main>
  );
}
