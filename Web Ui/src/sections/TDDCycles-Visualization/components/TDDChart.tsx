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

function TDDCharts({ commits, tddLogs, setMetric, port, role, commitsTddCycles, typegraphs }: Readonly<CycleReportViewProps>) {
  const maxLinesInGraph = 100;

  const getAvailableOptions = () => {
    return options.filter((option) => {
      if (!tddLogs || tddLogs.length === 0) {
        if (option.value === 'Dashboard' || option.value === 'Ciclo de ejecución de pruebas') {
          return false;
        }
      }

      if (typegraphs === 'aditionalgraph') {
        return ['Complejidad', 'Pie'].includes(option.value);
      }

      return !['Complejidad', 'Pie'].includes(option.value);
    });
  };

  const resolveMetric = (storedMetric: string | null) => {
    const availableOptions = getAvailableOptions();
    const fallbackMetric = availableOptions[0]?.value ?? 'Dashboard';

    if (!storedMetric) {
      return fallbackMetric;
    }

    return availableOptions.some((option) => option.value === storedMetric)
      ? storedMetric
      : fallbackMetric;
  };

  const [metricSelected, setMetricSelected] = useState(() => {
    return resolveMetric(localStorage.getItem("selectedMetric"));
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const nextMetric = resolveMetric(localStorage.getItem("selectedMetric"));
      setMetricSelected(nextMetric);
      setMetric(nextMetric);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [setMetric]);

  useEffect(() => {
    const nextMetric = resolveMetric(metricSelected);

    if (nextMetric !== metricSelected) {
      setMetricSelected(nextMetric);
      setMetric(nextMetric);
      localStorage.setItem("selectedMetric", nextMetric);
    }
  }, [metricSelected, setMetric, tddLogs, typegraphs]);

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

  const availableOptions = getAvailableOptions();

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
            {availableOptions.map((option) => (
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