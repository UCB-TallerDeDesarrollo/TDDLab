import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { Line, getElementAtEvent } from "react-chartjs-2";
import { useRef, useState } from "react";
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import "../styles/TDDChartStyles.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  LineElement
);

interface CycleReportViewProps {
  commits: CommitDataObject[] | null;
  jobsByCommit: JobDataObject[] | null;
}

function TDDCharts({ commits, jobsByCommit }: CycleReportViewProps) {
  function getDataLabels() {
    if (commits != null) {
      const commitsArray = commits.map((commit) => commits.indexOf(commit));
      return commitsArray;
    } else {
      return [];
    }
  }

  const getBarStyle = (commit: CommitDataObject) => {
    if (jobsByCommit != null) {
      const job = jobsByCommit.find((job) => job.sha === commit.sha);
      console.log("TEST", job);
      if (job != null && job.conclusion === "success") {
        return "green";
      } else {
        return "red";
      }
    } else {
      return "black";
    }
  };

  function getColorConclusion() {
    if (commits != null && jobsByCommit != null) {
      const conclusions = commits.map((commit) => getBarStyle(commit));
      return conclusions.reverse();
    } else {
      return ["white"];
    }
  }

  function getCommitStats() {
    if (commits != null) {
      const additions = commits
        .map((commit) => commit.stats.additions)
        .reverse();
      const deletions = commits
        .map((commit) => commit.stats.deletions)
        .reverse();
      const total = commits.map((commit) => commit.stats.total).reverse();
      return [additions, deletions, total];
    } else {
      return [[], [], []];
    }
  }

  function getCommitCoverage(){
    if (commits != null) {
      const coverage = commits
        .map((commit) => commit.coverage)
        .reverse();
      return coverage;
    } else {
      return [];
    }
  }

  function getCommitLink() {
    if (commits != null) {
      const urls = commits.map((commit) => commit.html_url);
      return urls.reverse();
    } else {
      return [];
    }
  }

  const dataLineChart = {
    labels: getDataLabels(),
    datasets: [
      {
        label: "Lineas de Código Modificadas",
        backgroundColor: getColorConclusion(),
        data: getCommitStats()[2],
        links: getCommitLink(),
      }
    ],
  };

  const dataLineChartCoverage = {
    labels: getDataLabels(),
    datasets: [
      {
        label: "Coverage",
        backgroundColor: getColorConclusion(),
        data: getCommitCoverage(),
        links: getCommitLink(),
      },
    ],
  };

  function getOptionsChart(axisText:string){
    const optionsLineChart = {
      responsive: true,
      pointRadius: 12,
      pointHoverRadius: 15,
      scales: {
        x: {
          title: {
            display: true,
            text: "Commits Realizados",
            font: {
              size: 20,
              weight: "bold",
              lineHeight: 1.2,
            },
          },
        },
        y: {
          max: 100,
          title: {
            display: true,
            text: axisText,
            font: {
              size: 20,
              weight: "bold",
              lineHeight: 1.2,
            },
          },
        },
      },
    };
    return optionsLineChart;
  }
  

  const chartRef = useRef<any>();

  function getClickableLink(dataChart:any){
    return (event: any) => {
      if (getElementAtEvent(chartRef.current, event).length > 0) {
        const dataSetIndexNum = getElementAtEvent(chartRef.current, event)[0]
          .datasetIndex;
        const dataPoint = getElementAtEvent(chartRef.current, event)[0].index;
        console.log(dataChart.datasets[dataSetIndexNum].links[dataPoint]);
        window.open(
          dataChart.datasets[dataSetIndexNum].links[dataPoint],
          "_blank"
        );
      }
    };
  }

  const [age, setAge] = useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };

  return (
    <div className="lineChartContainer">
      <Box>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Age</InputLabel>
          <Select
            labelId="select-label"
            id="simple-select"
            value={age}
            label="Age"
            onChange={handleChange}
          >
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <div  className="CoverageChart lineChart">
      <Line
        height="100"
        data={dataLineChartCoverage}
        options={getOptionsChart("Coverage")}
        onClick={getClickableLink(dataLineChartCoverage)}
        ref={chartRef}
      />
      </div>
      <div className="CodeLinesChart lineCart">
      <Line
        height="100"
        data={dataLineChart}
        options={getOptionsChart("Lineas de Código")}
        onClick={getClickableLink(dataLineChart)}
        ref={chartRef}
      />
      </div>
    </div>
  );
}

export default TDDCharts;
