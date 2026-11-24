import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { useState, useEffect } from "react";
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
import { useTDDDashboard } from "../hooks/useTDDDashboard";

const LEGACY_METRICS = new Set(["Ciclo de ejecución de pruebas"]);

function normalizeMetric(metric: string): string {
  return LEGACY_METRICS.has(metric) ? "Dashboard" : metric;
}

interface CycleReportViewProps {
  commits: CommitDataObject[] | null;
  tddLogs: TDDLogEntry[] | null;
  metric: string | null;
  setMetric: (metric: string) => void;
  port: CommitHistoryRepository;
  role: string;
  commitsTddCycles: CommitCycle[] | null;
  typegraphs: string;
}

function TDDCharts({ commits, tddLogs, setMetric, commitsTddCycles, typegraphs }: Readonly<CycleReportViewProps>) {
  const maxLinesInGraph = 100;
  const dashboardState = useTDDDashboard(commits, commitsTddCycles, tddLogs);
  const [metricSelected, setMetricSelected] = useState(() => {
    const initialMetric = localStorage.getItem("selectedMetric") ?? "Dashboard";
    return normalizeMetric(initialMetric);
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const storedMetric = localStorage.getItem("selectedMetric") ?? "Dashboard";
      const metric = normalizeMetric(storedMetric);
      setMetricSelected(metric);
      setMetric(metric);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [setMetric]);

  // Las métricas siguen limitando el total de líneas, pero sin mutar los commits
  // originales que consume el dashboard.
  const filteredCommitsObject = commits?.map((commit) => ({
    ...commit,
    commit: { ...commit.commit },
    stats: {
      ...commit.stats,
      total:
        commit.stats.total > maxLinesInGraph ? 50 : commit.stats.total,
    },
  })) ?? null;

  if (!commits) {
    return <div>No data available</div>;
  }

  const handleSelectChange = (event: SelectChangeEvent) => {
    const newMetric = event.target.value;
    setMetricSelected(newMetric);
    setMetric(newMetric);

    localStorage.setItem("selectedMetric", newMetric);

    const storageEvent = new Event("storage");
    window.dispatchEvent(storageEvent);
  };

  const options = [
    { value: 'Complejidad', label: 'Lista de Complejidad' },
    { value: 'Pie', label: 'Distribución de Commits' },
    { value: 'Dashboard', label: 'Dashboard' },
    { value: 'Total Número de Tests', label: 'Total Número de Tests' },
    { value: 'Cobertura de Código', label: 'Porcentaje de Cobertura de Código' },
    { value: 'Líneas de Código Modificadas', label: 'Líneas de Código Modificadas' },
    { value: 'Lista', label: 'Lista de Commits' },
  ];

  return (
    <div className="lineChartContainer">
      <Box>
        <FormControl fullWidth>
          <InputLabel id="simple-select-label">Métricas</InputLabel>
          <Select
            labelId="select-label"
            id="simple-select"
            onChange={handleSelectChange}
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
      <TDDLineCharts
        filteredCommitsObject={filteredCommitsObject}
        optionSelected={metricSelected}
        dashboardState={dashboardState}
      />
    </div>
  );
}

export default TDDCharts;
