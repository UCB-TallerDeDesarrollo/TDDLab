import React, { useRef, useState } from "react";
import { Bubble, Line } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { getElementAtEvent } from 'react-chartjs-2';
import { formatDate } from '../../../modules/TDDCycles-Visualization/application/GetTDDCycles';
import { Padding } from "@mui/icons-material";

ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

interface CycleReportViewProps {
  commits: CommitDataObject[];
  jobsByCommit: JobDataObject[];
}


const TDDBoard: React.FC<CycleReportViewProps> = ({ commits, jobsByCommit }) => {
  const [zoomedChart, setZoomedChart] = useState<"coverage" | "linesModified" | "testCount" | null>(null);
  const chartRefCoverage = useRef<any>();
  const chartRefModifiedLines = useRef<any>();
  const chartRefTestCount = useRef<any>();

  const testCounts = commits.map(commit => commit.test_count);
  const minTestCount = Math.min(...testCounts);
  const maxTestCount = Math.max(...testCounts);
  const numberOfLabels = 5;
  const step = Math.ceil(maxTestCount / (numberOfLabels));
  const labels = Array.from({ length: numberOfLabels }, (_, i) => maxTestCount - i * step);

  const getColorByTestCountAndConclusion = (testCount: number, conclusion: string) => {
    const intensity = (testCount - minTestCount) / (maxTestCount - minTestCount);
    const adjustedIntensity = Math.max(0.5, Math.min(intensity, 1)); 
  
    if (conclusion === "success") {
      const greenValue = Math.floor(200 + (55 * adjustedIntensity)); 
      const alpha = adjustedIntensity;
      return `rgba(0, ${greenValue}, 0, ${alpha})`; 
    } else {
      return `rgba(255, 0, 0, ${adjustedIntensity})`;
    }
  };
  
  const getChartOptions = (yAxisText: string) => {
    return {
      responsive: true,
      pointRadius: 8,
      pointHoverRadius: 15,
      scales: {
        x: {
          title: {
            display: true,
            text: "Commits Realizados",
            font: {
              size: 13,
              lineHeight: 1.2,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: yAxisText,
            font: {
              size: 10,
              lineHeight: 1.2,
              padding: { top: 20 }
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function (context: any) {
              return `Commit ${context[0].dataIndex + 1}: ${commits[commits.length - 1 - context[0].dataIndex].commit.message}`;
            },
            
            afterBody: function (context: any) {
              const commit = commits[commits.length - 1 - context[0].dataIndex];
              const afterBodyContent: any = [];
              afterBodyContent.push(
                `Líneas de Código Añadido: ${commit.stats.additions}`
              );
              afterBodyContent.push(
                `Líneas de Código Eliminado: ${commit.stats.deletions}`
              );
              afterBodyContent.push(
                `Total de Cambios: ${commit.stats.total}`
              );
              afterBodyContent.push(
                `Fecha: ${formatDate(new Date(commit.commit.date))}`
              );
              const coverageValue = commit.coverage;
              const formattedCoverage = coverageValue !== undefined && coverageValue !== null ? `${coverageValue}%` : '0%';
              afterBodyContent.push(
                `Cobertura: ${coverageValue === 0 ? '0%' : formattedCoverage}`
              );
              return afterBodyContent;
            },
          },
        },
      },
    };
  };

  const onClick = (chartRef: React.RefObject<any>) => (event: any) => {
    if (getElementAtEvent(chartRef.current, event).length > 0) {
      const dataPoint = getElementAtEvent(chartRef.current, event)[0].index;
      const links = commits.map(commit => commit.html_url).reverse();
      window.open(links[dataPoint], "_blank");
    }
  };

  const getLineChartData = (label: string, data: number[]) => {
    return {
      labels: commits.map((_, index) => `Commit ${index + 1}`),
      datasets: [{
        label,
        data: data.reverse(),
        backgroundColor: commits.map((commit) => {
          const job = jobsByCommit.find(job => job.sha === commit.sha);
          if (job?.conclusion === "success") return "green";
          else if (job === undefined) return "black";
          else return "red";
        }).reverse(),
        borderColor: "rgba(0, 0, 0, 0.2)",
        links: commits.map(commit => commit.html_url).reverse(),
      }],
    };
  };

  const handleDoubleClick = (chart: "coverage" | "linesModified" | "testCount") => {
    setZoomedChart(chart);
  };

  const closeModal = () => setZoomedChart(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent:"center" }}>
      <h2>Métricas de Commits con Cobertura de Código</h2>
      <div style={{ width: "80%", marginBottom: "20px" }}>
        <Bubble data={{
          datasets: commits.slice().reverse().map((commit, index) => {
            const job = jobsByCommit.find(job => job.sha === commit.sha);
            const backgroundColor = getColorByTestCountAndConclusion(commit.test_count, job?.conclusion || "failed");

            return {
              label: `Commit ${index + 1}`,
              data: [{
                x: index + 1,
                y: commit.coverage,
                r: Math.max(10, commit.stats.total / 1.5),
              }],
              backgroundColor,
              borderColor: `rgba(0,0,0,0.2)`,
              hoverBackgroundColor: "rgba(0,0,0,0.3)",
              hoverBorderColor: "rgba(0,0,0,0.1)"
            };
          })
        }} options={{
          scales: {
            x: { 
              title: { display: true, text: "Commits" },
              ticks: { 
                callback: (value: any) => `Commit ${value}` 
              }
            },
            y: { 
              title: { display: true, text: "Cobertura de Pruebas (%)" }, 
              min: 70, 
              max: 110, 
              suggestedMax: 120 
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (tooltipItem: any) => {
                  const index = tooltipItem.raw.x - 1; 
                  const commit = commits[index];
                  const commitNumber = index + 1;
        
                  return [
                    `Commit ${commitNumber}: ${commit.commit.message}`, 
                    `Líneas Modificadas: ${commit.stats.additions}`,
                    `Líneas Eliminadas: ${commit.stats.deletions}`,
                    `Cobertura: ${commit.coverage}%`,
                    `Total de Tests: ${commit.test_count}`,
                  ];
                }
              }
            }
          }
        }} />
      </div>

      <div style={{ display: "flex" }}>
      {zoomedChart && (
        <div className="zoom-modal" onClick={closeModal} style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100vh", 
          backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent:"center",
          zIndex: 1000
        }}>
          <div style={{ width: "80%", backgroundColor: "white", padding: "20px", borderRadius: "8px" }}>
            <Line
              data={zoomedChart === "coverage" ? getLineChartData("Cobertura de Código", commits.map(commit => commit.coverage)) :
                     zoomedChart === "linesModified" ? getLineChartData("Líneas de Código Modificadas", commits.map(commit => commit.stats.total)) :
                     getLineChartData("Número de Tests", commits.map(commit => commit.test_count))}
              options={getChartOptions(zoomedChart === "coverage" ? "Cobertura de Código" : zoomedChart === "linesModified" ? "Líneas de Código Modificadas" : "Número de Tests")}
            />
          </div>
        </div>
      )}
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: "35px", justifyContent: "space-between", marginBottom:"30px" }}>
        <div style={{ width: "30%"}} onDoubleClick={() => handleDoubleClick("coverage")}>
          <h3>Cobertura de Código</h3>
          <Line
            data={getLineChartData("Porcentaje de Cobertura de Código", commits.map(commit => commit.coverage))}
            options={getChartOptions("Cobertura de Código")}
            onClick={onClick(chartRefCoverage)}
            ref={chartRefCoverage}
          />
        </div>
        <div style={{ width: "30%"}} onDoubleClick={() => handleDoubleClick("linesModified")}>
          <h3>Líneas de Código Modificadas</h3>
          <Line
            data={getLineChartData("Total de Líneas de Código Modificadas", commits.map(commit => commit.stats.total))}
            options={getChartOptions("Líneas de Código Modificadas")}
            onClick={onClick(chartRefModifiedLines)}
            ref={chartRefModifiedLines}
          />
        </div>
        <div style={{ width: "30%"}} onDoubleClick={() => handleDoubleClick("testCount")}>
          <h3>Total Número de Tests</h3>
          <Line
            data={getLineChartData("Total Número de Tests", commits.map(commit => commit.test_count))}
            options={getChartOptions("Número de Tests")}
            onClick={onClick(chartRefTestCount)}
            ref={chartRefTestCount}
          />
        </div>
      </div>
      </div>
      <div style={{
        display: "flex",
        alignItems: "center",
        marginTop: "-740px",
        marginLeft: "1200px"
      }}>
        <div style={{
          width: "40px",
          height: "400px",
          background: "linear-gradient(to bottom, rgba(0,255,0,1), rgba(0,255,0,0))",
          textAlign: "center",
          position: "relative"
        }}>
          <p style={{ marginTop: '-60px', color: "#000", fontWeight: "bold", textAlign: "left"}}> Tests por Commit</p>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "300px",
          marginLeft: "10px",
          fontSize: "12px",
          color: "#000"
        }}>
          {labels.map(label => (
            <p key={label} style={{ margin: 0 }}>{label}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TDDBoard;