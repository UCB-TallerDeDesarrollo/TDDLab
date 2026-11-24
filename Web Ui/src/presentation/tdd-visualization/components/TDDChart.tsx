import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { useState, useEffect, useMemo } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import "../styles/TDDChartStyles.css";
import TDDLineCharts from "./TDDLineChart";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import { CommitCycle } from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";
import { TDDLogEntry } from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import { getCommitGraph } from "../../../modules/TDDCycles-Visualization/domain/getCommitGraph";
import {
  type BranchSelection,
  buildBranchMetadata,
  resolveActiveBranches,
  toggleBranchSelection,
} from "./branchVisualization";

interface CycleReportViewProps {
  commits: CommitDataObject[] | null;
  tddLogs: TDDLogEntry[] | null;
  metric: string | null;
  setMetric: (metric: string) => void;
  port: CommitHistoryRepository;
  role: string;
  commitsTddCycles: CommitCycle[] | null;
  typegraphs: string;
  logsError?: boolean;
}

function TDDCharts({
  commits,
  tddLogs,
  setMetric,
  port,
  role,
  commitsTddCycles,
  typegraphs,
  logsError = false,
}: Readonly<CycleReportViewProps>) {
  const defaultMetric = typegraphs === "aditionalgraph" ? "Complejidad" : "Dashboard";
  const [storedMetric, setMetricSelected] = useState(() => {
    const initialMetric = localStorage.getItem("selectedMetric") ?? defaultMetric;
    return initialMetric;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const storedMetric = localStorage.getItem("selectedMetric") ?? defaultMetric;
      setMetricSelected(storedMetric);
      setMetric(storedMetric);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [defaultMetric, setMetric]);

  const gitGraph = useMemo(() => getCommitGraph(tddLogs), [tddLogs]);
  const measuredShas = useMemo(
    () => new Set((commits ?? []).map((commit) => commit.sha)),
    [commits],
  );
  const branchMeta = useMemo(
    () => buildBranchMetadata(gitGraph, measuredShas),
    [gitGraph, measuredShas],
  );
  const [branchSelection, setBranchSelection] = useState<BranchSelection>("auto");
  const [previewBranch, setPreviewBranch] = useState<string | "all" | null>(null);

  useEffect(() => {
    setBranchSelection("auto");
    setPreviewBranch(null);
  }, [branchMeta.branchesKey]);

  const selectedBranches = useMemo(
    () => resolveActiveBranches(branchSelection, branchMeta),
    [branchSelection, branchMeta],
  );

  const activeBranches = useMemo<ReadonlySet<string> | null>(() => {
    if (previewBranch === "all") return null;
    if (previewBranch && branchMeta.branchColorMap.has(previewBranch)) {
      return new Set([previewBranch]);
    }
    return selectedBranches;
  }, [previewBranch, branchMeta, selectedBranches]);

  const handleToggleBranch = (branch: string) => {
    setBranchSelection((prev) => toggleBranchSelection(prev, branch, branchMeta));
  };

  const handleSelectAllBranches = () => {
    setBranchSelection("all");
  };

  if (!commits) {
    return <div>No data available</div>;
  }

  const selectMetric = (newMetric: string) => {
    setMetricSelected(newMetric);
    setMetric(newMetric);

    localStorage.setItem("selectedMetric", newMetric);

    const storageEvent = new Event("storage");
    window.dispatchEvent(storageEvent);
  };

  const cycleMetric = "Ciclo de ejecución de pruebas";
  const additional = ["Complejidad", "Pie"].includes(storedMetric);
  const metricSelected = additional === (typegraphs === "aditionalgraph") ? storedMetric : defaultMetric;
  const showingCycle = metricSelected === cycleMetric;
  const showingHistory = metricSelected === "Lista";

  const options = [
    { value: 'Complejidad', label: 'Lista de Complejidad' },
    { value: 'Pie', label: 'Distribución de Commits' },
    { value: 'Dashboard', label: 'Dashboard' },
    { value: 'Total Número de Tests', label: 'Total Número de Tests' },
    { value: 'Cobertura de Código', label: 'Porcentaje de Cobertura de Código' },
    { value: 'Líneas de Código Modificadas', label: 'Líneas de Código Modificadas' },
    { value: 'Lista', label: 'Lista de Commits' },
    { value: 'Ciclo de ejecución de pruebas', label: 'Ciclo de ejecución de pruebas' },
  ];

  return (
    <div className={showingCycle || showingHistory || metricSelected === "Dashboard"
      ? "lineChartContainer lineChartContainer--responsive"
      : "lineChartContainer"}>
      <Box>
        <FormControl fullWidth>
          <InputLabel id="simple-select-label">Métricas</InputLabel>
          <Select
            labelId="simple-select-label"
            id="simple-select"
            onChange={(event: SelectChangeEvent) => selectMetric(event.target.value)}
            value={metricSelected}
            data-testid="select-graph-type"
            label="Métricas"
            MenuProps={{
              PaperProps: { sx: { bgcolor: '#F0F0F0', borderRadius: 1, boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', mt: 0.5 } },
              sx: {
                '& .MuiMenuItem-root': { backgroundColor: 'transparent' },
                '& .MuiMenuItem-root:hover': { backgroundColor: '#E6F0FA' },
                '& .MuiMenuItem-root.Mui-selected': { backgroundColor: 'transparent' },
                '& .MuiMenuItem-root.Mui-selected:hover': { backgroundColor: '#E6F0FA' },
                '& .MuiMenuItem-root.Mui-focusVisible': { backgroundColor: 'transparent' }
              }
            }}
          >
            {options.filter(option => {
              if (typegraphs === 'aditionalgraph') {
                return ['Complejidad', 'Pie'].includes(option.value);
              } else {
                return !['Complejidad', 'Pie'].includes(option.value);
              }
            }).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {gitGraph && typegraphs !== "aditionalgraph" && showingCycle && (
        <Button
          variant="outlined"
          size="small"
          sx={{ alignSelf: "flex-start", mt: 1.5, textTransform: "none" }}
          onClick={() => selectMetric("Lista")}
        >
          Ver bifurcaciones
        </Button>
      )}
      <TDDLineCharts
        filteredCommitsObject={commits}
        tddLogs={tddLogs}
        optionSelected={metricSelected}
        port={port}
        role={role}
        commitsCycles={commitsTddCycles}
        gitGraph={gitGraph}
        branchMeta={branchMeta}
        selectedBranches={selectedBranches}
        activeBranches={activeBranches}
        previewBranch={previewBranch}
        onToggleBranch={handleToggleBranch}
        onSelectAllBranches={handleSelectAllBranches}
        onPreviewBranch={setPreviewBranch}
        onSelectMetric={selectMetric}
        logsError={logsError || tddLogs === null}
      />
    </div>
  );
}

export default TDDCharts;
