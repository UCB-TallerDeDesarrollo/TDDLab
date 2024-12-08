import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import "../styles/TDDChartStyles.css";
import TDDLineCharts from "./TDDLineChart";
import { GithubAPIRepository } from "../../../modules/TDDCycles-Visualization/domain/GithubAPIRepositoryInterface";
import { ComplexityObject } from "../../../modules/TDDCycles-Visualization/domain/ComplexityInterface";
import { CommitCycle } from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";

interface CycleReportViewProps {
  commits: CommitDataObject[] | null;
  jobsByCommit: JobDataObject[] | null;
  metric: string | null; // Cambié de String a string para mayor consistencia
  setMetric: (metric: string) => void; // Agregamos una función para actualizar el metric
  port: GithubAPIRepository;
  role: string;
  complexity:ComplexityObject[] | null;
  commitsTddCycles: CommitCycle[] | null;
}

function TDDCharts({ commits, jobsByCommit, setMetric,port,role,complexity, commitsTddCycles }: Readonly<CycleReportViewProps>) {
  const maxLinesInGraph = 100;

  const [metricSelected, setMetricSelected] = useState(() => {
    const initialMetric = localStorage.getItem("selectedMetric") || "Dashboard";
    return initialMetric;
  });
  useEffect(() => {
    const handleStorageChange = () => {
      console.log("storage event triggered");
      const storedMetric = localStorage.getItem("selectedMetric") || "Dashboard";
      setMetricSelected(storedMetric);
      setMetric(storedMetric);
      console.log("Detected localStorage change, new metric:", storedMetric);
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
  
      console.log(filteredCommitsObject);
      return filteredCommitsObject;
    }
    return commits;
  })();
  
  
  if (!commits || !jobsByCommit) {
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
             <MenuItem value={"Dashboard"}>
              Dashboard
            </MenuItem>
            <MenuItem value={"Total Número de Tests"}>
              Total Número de Tests
            </MenuItem>
            <MenuItem value={"Cobertura de Código"}>
              Porcentaje de Cobertura de Código
            </MenuItem>
            <MenuItem value={"Líneas de Código Modificadas"}>
              Líneas de Código Modificadas
            </MenuItem>
            <MenuItem value={"Lista"}>
              Lista de Commits
            </MenuItem>
            <MenuItem value={"Complejidad"}>
              Lista de Complejidad
            </MenuItem>
            <MenuItem value={"TddCiclos"}>
              TddCycles
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TDDLineCharts
        filteredCommitsObject={filteredCommitsObject}
        jobsByCommit={jobsByCommit}
        optionSelected={metricSelected}
        complexity = {complexity}
        port={port}
        role={role}
        commitsCycles={commitsTddCycles}
      />
    </div>
  );
}

export default TDDCharts;