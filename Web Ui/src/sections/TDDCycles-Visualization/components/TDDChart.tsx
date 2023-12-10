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

interface CycleReportViewProps {
  commits: CommitDataObject[] | null;
  jobsByCommit: JobDataObject[] | null;
}

function TDDCharts({ commits, jobsByCommit }: Readonly<CycleReportViewProps>) {
  const maxLinesInGraph = 100;
  const [metricSelected, setMetricSelected] = useState("Cobertura de Código");

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
    setMetricSelected(event.target.value);
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
            label="Metrics"
          >
            <MenuItem value={"Cobertura de Código"}>
              Porcentaje de Cobertura de Código
            </MenuItem>
            <MenuItem value={"Líneas de Código Modificadas"}>
              Líneas de Código Modificadas
            </MenuItem>
            <MenuItem value={"Total Número de Tests"}>
              Total Número de Tests
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TDDLineCharts 
        filteredCommitsObject={filteredCommitsObject} 
        jobsByCommit={jobsByCommit}
        optionSelected={metricSelected}
      ></TDDLineCharts>
    </div>
  );
}

export default TDDCharts;
