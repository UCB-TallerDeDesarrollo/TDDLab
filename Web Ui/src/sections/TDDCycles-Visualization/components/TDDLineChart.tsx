import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { getElementAtEvent, Line } from "react-chartjs-2";
import { useRef } from "react";
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
import TDDList from "./TDDList";
import { GithubAPIAdapter } from "../../../modules/TDDCycles-Visualization/repository/GithubAPIAdapter";

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

interface LineChartProps {
  filteredCommitsObject: CommitDataObject[] | null;
  jobsByCommit: JobDataObject[] | null;
  optionSelected: string;
}

function TDDLineCharts({
  filteredCommitsObject,
  jobsByCommit,
  optionSelected,
}: LineChartProps) {
  let dataChart: any = {};
  const chartRef = useRef<any>();

  function getDataLabels() {
    if (filteredCommitsObject != null) {
      const commitsArray = filteredCommitsObject.map(
        (commit) => `Commit ${filteredCommitsObject.indexOf(commit) + 1}`
      );
      return commitsArray;
    } else {
      return [];
    }
  }

  function getCommitName() {
    if (filteredCommitsObject != null) {
      const commitsArray = filteredCommitsObject.map(
        (commit) => commit.commit.message
      );
      return commitsArray.reverse();
    } else {
      return [];
    }
  }

  function getColorConclusion() {
    if (filteredCommitsObject != null && jobsByCommit != null) {
      const conclusions = filteredCommitsObject.map((commit) => {
        let job = jobsByCommit?.find((job) => job.sha === commit.sha);
        if (job != null && job.conclusion === "success") return "green";
        else if (job === undefined) return "black";
        else return "red";
      });
      return conclusions.reverse();
    } else {
      return ["white"];
    }
  }

  function getCommitStats() {
    if (filteredCommitsObject != null) {
      const additions = filteredCommitsObject
        .map((commit) => commit.stats.additions)
        .reverse();
      const deletions = filteredCommitsObject
        .map((commit) => commit.stats.deletions)
        .reverse();
      const total = filteredCommitsObject
        .map((commit) => commit.stats.total)
        .reverse();
      return [additions, deletions, total ];
    } else {
      return [[], [], [], []];
    }
  }

  function getCommitCoverage() {
    if (filteredCommitsObject != null) {
      const coverage = filteredCommitsObject
        .map((commit) => (commit.coverage != 0 ? commit.coverage : 0)) 
        .reverse();
      return coverage;
    } else {
      return [];
    }
  }

  function getTestsCount() {
    if (filteredCommitsObject != null) {
      const testCount = filteredCommitsObject
        .map((commit) => commit.test_count)
        .reverse();
      return testCount;
    } else {
      return [];
    }
  }

  function getCommitLink() {
    if (filteredCommitsObject != null) {
      const urls = filteredCommitsObject.map((commit) => commit.html_url);
      return urls.reverse();
    } else {
      return [];
    }
  }

  function getDataChart(dataChartSelected: any, dataLabel: string) {
    dataChart = {
      labels: getDataLabels(),
      datasets: [
        {
          label: dataLabel,
          backgroundColor: getColorConclusion(),
          data: dataChartSelected,
          links: getCommitLink(),
        },
      ],
    };
    return dataChart;
  }

  function getOptionsChart(axisText: string) {
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
              lineHeight: 1.2,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: axisText,
            font: {
              size: 20,
              lineHeight: 1.2,
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function (context: any) {
              return `${getDataLabels()[context[0].dataIndex]}: ${
                getCommitName()[context[0].dataIndex]
              }`;
            },
            afterBody: function (context: any) {
              const afterBodyContent: any = [];
              afterBodyContent.push(
                `Líneas de Código Añadido: ${
                  getCommitStats()[0][context[0].dataIndex]
                }`
              );

              afterBodyContent.push(
                `Líneas de Código Eliminado: ${
                  getCommitStats()[1][context[0].dataIndex]
                }`
              );
              afterBodyContent.push(
                `Total de Cambios: ${getCommitStats()[2][context[0].dataIndex]}`
              );

              afterBodyContent.push(
                `Fecha: ${getCommitStats()[3][context[0].dataIndex]}`
              );

              const coverageValue = getCommitCoverage()[context[0].dataIndex];
              const formattedCoverage =
                coverageValue !== undefined && coverageValue !== null
                  ? `${coverageValue}%`
                  : "0%";
              afterBodyContent.push(
                `Cobertura: ${coverageValue === 0 ? "0%" : formattedCoverage}`
              );
              afterBodyContent.push(
                `Total de Cambios: ${
                  getCommitStats()[2][context[0].dataIndex]
                }`,
              );
              const coverageValue = getCommitCoverage()[context[0].dataIndex];
              const formattedCoverage = coverageValue !== undefined && coverageValue !== null ? `${coverageValue}%` : '0%';
              afterBodyContent.push(
                `Cobertura: ${coverageValue === 0 ? '0%' : formattedCoverage}`,
              );
              return afterBodyContent;
            },
          },
        },
      },
    };
    return optionsLineChart;
  }

  const onClick = (event: any) => {
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

  function getLineChart() {
    let dataChart: any = null;
    let optionsChart: any = null;
    let dataTestid: string = "";
    switch (optionSelected) {
      case "Cobertura de Código":
        dataChart = getDataChart(
          getCommitCoverage(),
          "Porcentaje de Cobertura de Código"
        );
        optionsChart = getOptionsChart("Cobertura de Código");
        dataTestid = "graph-coverage";
        break;
      case "Líneas de Código Modificadas":
        dataChart = getDataChart(
          getCommitStats()[2],
          "Total de Líneas de Código Modificadas"
        );
        optionsChart = getOptionsChart("Líneas de Código Modificadas");
        dataTestid = "graph-linesModified";
        break;
      case "Total Número de Tests":
        dataChart = getDataChart(getTestsCount(), "Total Número de Tests");
        optionsChart = getOptionsChart("Número de Tests");
        dataTestid = "graph-testCount";
        break;
      case "Lista":
        return <TDDList port={new GithubAPIAdapter()}></TDDList>;
    }
    return (
      <Line
        height="100"
        data={dataChart}
        options={optionsChart}
        onClick={onClick}
        ref={chartRef}
        data-testid={dataTestid}
      />
    );
  }

  return getLineChart();
}

export default TDDLineCharts;