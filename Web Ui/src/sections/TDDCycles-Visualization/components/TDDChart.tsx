import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { useState } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import "../styles/TDDChartStyles.css";
import TDDLineCharts from "./TDDLineChart";
import { GithubAPIRepository } from "../../../modules/TDDCycles-Visualization/domain/GithubAPIRepositoryInterface";
import TDDBar from "./graficas_prueba/TDDBar";

interface CycleReportViewProps {
  commits: CommitDataObject[] | null;
  jobsByCommit: JobDataObject[] | null;
  metric: string | null; // Cambié de String a string para mayor consistencia
  setMetric: (metric: string) => void; // Agregamos una función para actualizar el metric
  port: GithubAPIRepository;
  role: string;
}

function TDDCharts({ commits, jobsByCommit, metric, setMetric,port,role }: Readonly<CycleReportViewProps>) {
  const maxLinesInGraph = 100;
  const [metricSelected, setMetricSelected] = useState(metric ?? "Dashboard" );
  if (!commits || !jobsByCommit) {
    return <div>No data available</div>; 
  }
  const filteredCommitsObject = (() => {
    if (commits != null) {
      const filteredCommitsObject = commits.filter(
        (commit) => commit.stats.total < maxLinesInGraph,
      );
      return filteredCommitsObject;
    }
    return commits;
  })();

  const handleSelectChange = (event: SelectChangeEvent) => {
    const newMetric = event.target.value;
    setMetricSelected(newMetric);
    setMetric(newMetric); 
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
            
            <MenuItem value={"Pie"}>
              Distribución de Commits
              </MenuItem>

            <MenuItem value={"Lista"}>
              Lista de Commits
            </MenuItem>


          </Select>
        </FormControl>
      </Box>
      {/* Renderiza el gráfico correspondiente */}
      {(() => {
        switch (metricSelected) {
          
          
          default:
            return (
              <TDDLineCharts
                filteredCommitsObject={filteredCommitsObject}
                jobsByCommit={jobsByCommit}
                optionSelected={metricSelected}
                port={port}
                role={role}
              />
             );
            }
          })()}
    </div>
  );
}

export default TDDCharts;