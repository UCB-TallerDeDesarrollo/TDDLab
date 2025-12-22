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

function TDDCharts({ commits, tddLogs, setMetric, port, role, commitsTddCycles, typegraphs }: Readonly<CycleReportViewProps>) {
  const maxLinesInGraph = 100;
  const [metricSelected, setMetricSelected] = useState(() => {
    const initialMetric = localStorage.getItem("selectedMetric") ?? "Dashboard";
    return initialMetric;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const storedMetric = localStorage.getItem("selectedMetric") ?? "Dashboard";
      setMetricSelected(storedMetric);
      setMetric(storedMetric);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [setMetric]);

  const filteredCommitsObject = (() => {
    if (commits != null) {
      const filteredCommitsObject = commits.map((commit) => {
        // Si commit.stats.total es mayor que maxLinesInGraph, ajustamos a 50
        if (commit.stats.total > maxLinesInGraph) {
          commit.stats.total = 50;
        }
        // Devolvemos el commit (modificado o no) para que esté en el array
        return commit;
      });

      return filteredCommitsObject;
    }
    return commits;
  })();

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
    { value: 'Ciclo de ejecución de pruebas', label: 'Ciclo de ejecución de pruebas' },
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
          >
            {options.filter(option => {
              if (!tddLogs || tddLogs.length === 0) {
                if (option.value === 'Ciclo de ejecución de pruebas') {
                  return false;
                }
              }
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
        tddLogs = {tddLogs}
        optionSelected={metricSelected}
        port={port}
        role={role}
        commitsCycles={commitsTddCycles}
      />
    </div>
  );
}

export default TDDCharts;