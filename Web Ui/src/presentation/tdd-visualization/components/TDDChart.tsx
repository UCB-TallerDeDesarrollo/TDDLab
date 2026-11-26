
import { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

import type { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import type { CommitCycle } from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";
import type { TDDLogEntry } from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";

import TDDLineCharts from "./TDDLineChart";
import "../styles/TDDChartStyles.css";

interface TDDChartProps {
  commits: CommitDataObject[] | null;
  tddLogs: TDDLogEntry[] | null;
  metric: string | null;
  setMetric: (metric: string) => void;
  port: CommitHistoryRepository;
  role: string;
  commitsTddCycles: CommitCycle[] | null;
  typegraphs: string;
  selectedBranch?: string;
}

const options = [
  { value: "Complejidad", label: "Lista de Complejidad" },
  { value: "Pie", label: "Distribución de Commits" },
  { value: "Dashboard", label: "Dashboard" },
  { value: "Total Número de Tests", label: "Total Número de Tests" },
  { value: "Cobertura de Código", label: "Cobertura de Código" },
  {
    value: "Líneas de Código Modificadas",
    label: "Líneas de Código Modificadas",
  },
  { value: "Lista", label: "Lista de Commits" },
  {
    value: "Ciclo de ejecución de pruebas",
    label: "Ciclo de ejecución de pruebas TDD",
  },
  {
    value: "Topología Git",
    label: "Topología de ramas Git (DAG)",
  },
];

function getOptions(typegraphs: string) {
  if (typegraphs === "aditionalgraph") {
    return options.filter((option) =>
      ["Complejidad", "Pie"].includes(option.value)
    );
  }

  return options.filter(
    (option) => !["Complejidad", "Pie"].includes(option.value)
  );
}

function getDefaultMetric(typegraphs: string) {
  return typegraphs === "aditionalgraph"
    ? "Complejidad"
    : "Dashboard";
}

function TDDCharts({
  commits,
  tddLogs,
  metric,
  setMetric,
  port,
  role,
  commitsTddCycles,
  typegraphs,
  selectedBranch = "",
}: Readonly<TDDChartProps>) {
  const availableOptions = getOptions(typegraphs);

  const [metricSelected, setMetricSelected] = useState<string>(() => {
    const stored = localStorage.getItem("selectedMetric");

    return availableOptions.some((option) => option.value === stored)
      ? stored!
      : getDefaultMetric(typegraphs);
  });

  useEffect(() => {
    if (
      metric &&
      availableOptions.some((option) => option.value === metric)
    ) {
      setMetricSelected(metric);
    }
  }, [metric, typegraphs]);

  useEffect(() => {
    if (
      !availableOptions.some(
        (option) => option.value === metricSelected
      )
    ) {
      const fallback = getDefaultMetric(typegraphs);
      setMetricSelected(fallback);
      setMetric(fallback);
    }
  }, [typegraphs, metricSelected, setMetric]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const nextMetric = event.target.value;

    setMetricSelected(nextMetric);
    setMetric(nextMetric);
    localStorage.setItem("selectedMetric", nextMetric);
  };

  const branchLabel =
    selectedBranch === "all"
      ? "Todas las ramas"
      : selectedBranch || "Predeterminada del repositorio";

  return (
    <div className="lineChartContainer">
      <Box
        sx={{
          p: 2,
          mb: 2,
          border: "1px solid #e2e8f0",
          backgroundColor: "#f1f5f9",
          borderRadius: 2,
        }}
      >
        <strong>Rama analizada: </strong>
        {branchLabel}

        <Box sx={{ mt: 1, color: "#64748b", fontSize: 13 }}>
          {commits?.length ?? 0} commits recibidos del backend
        </Box>
      </Box>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="metrics-label">Métricas</InputLabel>

        <Select
          labelId="metrics-label"
          value={metricSelected}
          label="Métricas"
          onChange={handleChange}
          data-testid="select-graph-type"
        >
          {availableOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TDDLineCharts
        filteredCommitsObject={commits ?? []}
        tddLogs={tddLogs}
        optionSelected={metricSelected}
        port={port}
        role={role}
        commitsCycles={commitsTddCycles}
        selectedBranch={selectedBranch}
        onMetricChange={(nextMetric) => {
          setMetricSelected(nextMetric);
          setMetric(nextMetric);
          localStorage.setItem("selectedMetric", nextMetric);
        }}
      />
    </div>
  );
}

export default TDDCharts;
