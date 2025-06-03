import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommitCycle } from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";
import { getElementAtEvent, Line } from "react-chartjs-2";
import { useEffect, useRef, useState } from "react";
import { formatDate } from '../../../modules/TDDCycles-Visualization/application/GetTDDCycles';

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
import { CommitHistoryAdapter } from "../../../modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";
import TDDBoard from "./TDDBoard";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import { ComplexityObject } from "../../../modules/TDDCycles-Visualization/domain/ComplexityInterface";
import axios from "axios";
import TDDBar from "./Graficas-Adicionales/TDDBarCycle";
import TDDPie from "./Graficas-Adicionales/TDDPie";

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
  optionSelected: string;
  port: CommitHistoryRepository;
  role: string;
  complexity: ComplexityObject[] | null;
  commitsCycles: CommitCycle[] | null;
}

function TDDLineCharts({
  filteredCommitsObject,
  optionSelected,
  port,
  role,
  complexity,
  commitsCycles
}: LineChartProps) {
  
  let dataChart: any = {};
  const chartRef = useRef<any>();

  const [analyzeData, setAnalyzeData] = useState<string[]>([]); 
  
  useEffect(() => {
    if (optionSelected === "Complejidad" && complexity && filteredCommitsObject) {
      const analyzeCommits = async () => {
        const reversedCommits = filteredCommitsObject.slice().reverse();
        const responses: string[] = [];

        for (const commit of reversedCommits) {
          const requestBody = { repoUrl: commit.html_url };

          try {
            const response = await axios.post(
              "https://api-ccn.vercel.app/analyze",
              requestBody,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            responses.push(JSON.stringify(response.data));
            
          } catch (error) {
            console.error("Error al procesar el commit:", error);
          }
        }

        setAnalyzeData(responses);
      };

      analyzeCommits();
    }
  }, [optionSelected, filteredCommitsObject, complexity]);

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

  function containsRefactor(commitMessage: string): boolean {
    const regex = /\brefactor(\w*)\b/i;
    return regex.test(commitMessage);
  }

  function getColorConclusion(): string[] {
  if (!filteredCommitsObject) return ["white"];

  return filteredCommitsObject
    .map(getCommitColor)
    .reverse();
  }

  function getCommitColor(commit: CommitDataObject): string {
    if (
    !commit || typeof commit !== "object" ||
    !commit.commit || typeof commit.commit.message !== "string"
    ) {
    return "red"; // Valor por defecto en caso de datos malformados
    }
    const { coverage, test_count, conclusion, commit: commitInfo } = commit;

    if (
    coverage === undefined || 
    coverage === null
    ) return "black";

    const hasNoTestsOrCoverageFailed = 
      test_count === 0 || 
      test_count === undefined || 
      coverage === 0 || 
      conclusion === "failure";

    if (hasNoTestsOrCoverageFailed) return "red";

    const isRefactor = containsRefactor(commitInfo.message);
    return getColorByCoverage(coverage, isRefactor);
  }

  const getColorByCoverage = (coverage: number, isRefactor: boolean) => {
    let colorValue = 110;
    let opacity;
    const baseColor = isRefactor ? 'blue' : 'green';
  
    if (coverage >= 90) {
      opacity = 1;
    } else if (coverage >= 80) {
      opacity = 0.8;
    } else if (coverage >= 70) {
      opacity = 0.6;
    } else if (coverage >= 60) {
      opacity = 0.4;
    } else {
      opacity = 0.2;
    }
  
    return baseColor === 'green'
      ? `rgba(0, ${colorValue}, 0, ${opacity})`
      : `rgba(0, 100, 255, ${opacity})`;
  };
  
  function getCommitStats(): [number[], number[], number[], Date[]] {
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
      
      const creation_date = filteredCommitsObject
        .map((commit) => new Date(commit.commit.date))
        .reverse();
      
      return [additions, deletions, total, creation_date];
    } else {
      return [[], [], [], []];
    }
  }

  function getCommitCoverage() {
    if (filteredCommitsObject != null) {
      const coverage = filteredCommitsObject
        .map((commit) => (commit.coverage != null && commit.coverage !== 0 ? commit.coverage : 0))
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
                `Fecha: ${formatDate(getCommitStats()[3][context[0].dataIndex])}`,
              );
              
              const coverageValue = getCommitCoverage()[context[0].dataIndex];
              const formattedCoverage = coverageValue !== undefined && coverageValue !== null ? `${coverageValue}%` : '0%';
              afterBodyContent.push(
                `Cobertura: ${coverageValue === 0 ? '0%' : formattedCoverage}`,
              );

              const complexityResponse = analyzeData[context[0].dataIndex];
              //console.log("EX1M"+complexityResponse)
              if (complexityResponse) {
                afterBodyContent.push(`Complejidad Ciclomática: ${complexityResponse}`);
              }
              return afterBodyContent;
            },
          },
        },
      },
    };
    return optionsLineChart;
  }
  
  
  const onClick = (event: any) => {
    if (getElementAtEvent(chartRef.current, event).length >= 0) {
      const dataSetIndexNum = getElementAtEvent(chartRef.current, event)[0]
        .datasetIndex;
      const dataPoint = getElementAtEvent(chartRef.current, event)[0].index;
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
        return <TDDList port={new CommitHistoryAdapter()}></TDDList>;
      case "Dashboard":
          return <TDDBoard commits={filteredCommitsObject || []} port={port} role={role}/>;
      case "Complejidad":
            if (complexity != null) {
                dataChart = getDataChart(
                complexity?.map((data) => data.ciclomaticComplexity),
                "Complejidad Ciclomática"
              );
              optionsChart = getOptionsChart("Complejidad Ciclomática");
              dataTestid = "graph-complexity";
            }
            break;
          
      case "TddCiclos":
        return <TDDBar CommitsCycles={commitsCycles || []}></TDDBar>
      case "Pie":
        return <TDDPie commits={filteredCommitsObject || []} />;     
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