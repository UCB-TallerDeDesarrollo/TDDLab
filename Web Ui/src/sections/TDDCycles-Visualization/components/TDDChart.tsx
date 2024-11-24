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
import { ComplexityObject } from "../../../modules/TDDCycles-Visualization/domain/complexityInferface";

interface CycleReportViewProps {
  commits: CommitDataObject[] | null;
  jobsByCommit: JobDataObject[] | null;
  metric: string | null; // Cambié de String a string para mayor consistencia
  setMetric: (metric: string) => void; // Agregamos una función para actualizar el metric
  port: GithubAPIRepository;
  role: string;
  complexity: ComplexityObject[]| null;
}

function TDDCharts({ commits, jobsByCommit,complexity, metric, setMetric,port,role }: Readonly<CycleReportViewProps>) {
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
            <MenuItem value={"Lista"}>
              Lista de Commits
            </MenuItem>
            <MenuItem value={"Complexity Analysis"}>
              Complejidad Ciclomática
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TDDLineCharts
        filteredCommitsObject={filteredCommitsObject}
        jobsByCommit={jobsByCommit}
        optionSelected={metricSelected}
        complexity={[
          { functionName: "func1", ciclomaticComplexity: 5, file: "file1.js" },
          { functionName: "func2", ciclomaticComplexity: 8, file: "file2.js" },
        ]}
        port={port}
        role={role}
      />
    </div>
  );
}

export default TDDCharts;