import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import type {
  SelectChangeEvent,
} from "@mui/material/Select";

import type {
  CommitDataObject,
} from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

import type {
  CommitHistoryRepository,
} from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";

import type {
  CommitCycle,
} from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";

import type {
  TDDLogEntry,
} from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";

import TDDLineCharts from "./TDDLineChart";

import "../styles/TDDChartStyles.css";

// =====================================================
// PROPIEDADES
// =====================================================

interface CycleReportViewProps {
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

// =====================================================
// MÉTRICAS DISPONIBLES
// =====================================================

const chartOptions = [
  {
    value: "Complejidad",
    label: "Lista de Complejidad",
  },
  {
    value: "Pie",
    label: "Distribución de Commits",
  },
  {
    value: "Dashboard",
    label: "Dashboard",
  },
  {
    value: "Total Número de Tests",
    label: "Total Número de Tests",
  },
  {
    value: "Cobertura de Código",
    label: "Porcentaje de Cobertura de Código",
  },
  {
    value: "Líneas de Código Modificadas",
    label: "Líneas de Código Modificadas",
  },
  {
    value: "Lista",
    label: "Lista de Commits",
  },
  {
    value: "Ciclo de ejecución de pruebas",
    label: "Ciclo de ejecución de pruebas",
  },
  {
    value: "Topología Git",
    label: "Topología de ramas Git",
  },
];

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

function getDefaultMetric(typegraphs: string) {
  return typegraphs === "aditionalgraph"
    ? "Complejidad"
    : "Dashboard";
}

function getOptionsByGraphType(
  typegraphs: string
) {
  if (typegraphs === "aditionalgraph") {
    return chartOptions.filter((option) =>
      ["Complejidad", "Pie"].includes(
        option.value
      )
    );
  }

  return chartOptions.filter(
    (option) =>
      !["Complejidad", "Pie"].includes(
        option.value
      )
  );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

function TDDCharts({
  commits,
  tddLogs,
  setMetric,
  port,
  role,
  commitsTddCycles,
  typegraphs,
  selectedBranch = "",
}: Readonly<CycleReportViewProps>) {

  const availableOptions =
    getOptionsByGraphType(typegraphs);

  const [metricSelected, setMetricSelected] =
    useState<string>(() => {
      const storedMetric =
        localStorage.getItem("selectedMetric");

      const valid =
        availableOptions.some(
          (option) =>
            option.value === storedMetric
        );

      return valid && storedMetric
        ? storedMetric
        : getDefaultMetric(typegraphs);
    });

  // ===================================================
  // SINCRONIZAR SELECCIÓN
  // ===================================================

  useEffect(() => {
    const valid =
      availableOptions.some(
        (option) =>
          option.value === metricSelected
      );

    if (!valid) {
      const defaultMetric =
        getDefaultMetric(typegraphs);

      setMetricSelected(defaultMetric);
      setMetric(defaultMetric);
    }

  }, [typegraphs, metricSelected, setMetric]);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedMetric =
        localStorage.getItem("selectedMetric");

      const nextMetric =
        availableOptions.some(
          (option) =>
            option.value === storedMetric
        ) && storedMetric
          ? storedMetric
          : getDefaultMetric(typegraphs);

      setMetricSelected(nextMetric);
      setMetric(nextMetric);
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };

  }, [typegraphs, setMetric]);

  // ===================================================
  // PREPARAR DATOS PARA LAS GRÁFICAS
  // ===================================================

  const filteredCommitsObject =
    useMemo(() => {
      if (!commits) return null;

      return commits.map((commit) => ({
        ...commit,
        stats: {
          ...commit.stats,

          // Conserva la escala visual original
          // sin modificar el objeto recibido.

          total:
            commit.stats.total > 100
              ? 50
              : commit.stats.total,
        },
      }));

    }, [commits]);

  // ===================================================
  // CAMBIAR MÉTRICA
  // ===================================================

  const handleSelectChange = (
    event: SelectChangeEvent<string>
  ) => {
    const newMetric = event.target.value;

    setMetricSelected(newMetric);
    setMetric(newMetric);

    localStorage.setItem(
      "selectedMetric",
      newMetric
    );

    window.dispatchEvent(
      new Event("storage")
    );
  };

  // ===================================================
  // SIN DATOS
  // ===================================================

  if (!commits) {
    return (
      <div>
        No hay información disponible.
      </div>
    );
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="lineChartContainer">

      {/* Rama seleccionada */}

      <Box
        sx={{
          marginBottom: 2,
          padding: 1.5,
          borderRadius: 2,
          backgroundColor: "#F1F5F9",
          border: "1px solid #E2E8F0",
        }}
      >
        <span
          style={{
            color: "#475569",
            fontSize: "14px",
          }}
        >
          Rama analizada:{" "}
          <strong
            style={{
              color: "#052845",
            }}
          >
            {selectedBranch ||
              "Predeterminada del repositorio"}
          </strong>
        </span>
      </Box>

      {/* Selector de visualización */}

      <Box sx={{ marginBottom: 3 }}>
        <FormControl fullWidth>

          <InputLabel
            id="simple-select-label"
          >
            Métricas
          </InputLabel>

          <Select
            labelId="simple-select-label"
            id="simple-select"
            value={metricSelected}
            onChange={handleSelectChange}
            data-testid="select-graph-type"
            label="Métricas"
          >

            {availableOptions.map(
              (option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              )
            )}

          </Select>

        </FormControl>
      </Box>

      {/* Gráficas y topología */}

      <TDDLineCharts
        filteredCommitsObject={
          filteredCommitsObject
        }
        tddLogs={tddLogs}
        optionSelected={metricSelected}
        port={port}
        role={role}
        commitsCycles={commitsTddCycles}
        selectedBranch={selectedBranch}
      />

    </div>
  );
}

export default TDDCharts;
