import React, { useRef, useState, useEffect } from "react";
import { Bubble, Line } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import TDDCharts from "./TDDChart";
import { GithubAPIRepository } from "../../../modules/TDDCycles-Visualization/domain/GithubAPIRepositoryInterface";
import TDDChartPage from "../TDDChartPage";
import TDDLineCharts from "./TDDLineChart";

ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

interface CycleReportViewProps {
  commits: CommitDataObject[];
  jobsByCommit: JobDataObject[];
  port: GithubAPIRepository;
  role: string;
}

const TDDBoard: React.FC<CycleReportViewProps> = ({ commits, jobsByCommit,role,port }) => {
  const chartRefCoverage = useRef<any>();
  const chartRefModifiedLines = useRef<any>();
  const chartRefTestCount = useRef<any>();
  const [graph, setGraph] = useState<string>("");
  
  const testCounts = commits.map(commit => commit.test_count);
  const testCountsColor = commits.map(commit => commit.coverage);
  const minTestCount = Math.min(...testCountsColor);
  const maxTestCount = Math.max(...testCountsColor);
  const maxTest = Math.max(...testCounts);
  const numberOfLabels = 3;
  const step = Math.ceil((maxTestCount - minTestCount) / numberOfLabels);
  const labels = Array.from({ length: numberOfLabels }, (_, i) => maxTestCount - i * step);
  
  const getColorByCoverage = (testCountsColor: number) => {
    let greenValue;
    let opacity = 1; 
  
    if (testCountsColor < 90) {
      greenValue = 155;  
      opacity = 0.4; 
    } else if (testCountsColor < 95) {
      greenValue = 180;  
      opacity = 0.7;
    } else {
      greenValue = 155;  
      opacity = 1; 
    }
  
    return `rgba(0, ${greenValue}, 0, ${opacity})`; 
  };
  
  const getColorByConclusion = (conclusion: string, coverage: number) => {
    if (conclusion === "success") {
      // Si el commit es exitoso, aplica el color basado en la cobertura
      return getColorByCoverage(coverage);
    } else {
      // Si el commit falló, usa un rojo sólido sin ajuste de opacidad
      return `rgba(255, 0, 0, 1)`;  // Rojo sólido
    }
  };
  
  

  const changeGraph = (graphText: string) => {
    setGraph(graphText);
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
        legend: {
          display: true,
        },
      },
    };
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

  useEffect(() => {
    if (graph) {
      // Aquí puedes manejar cómo quieres propagar la métrica, por ejemplo, a un contexto global o almacenamiento.
      console.log("Métrica seleccionada:", graph); // Puedes reemplazar esto con la lógica necesaria para manejar la métrica
    }
  }, [graph]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

      {/* Gráfico Burbuja solo se muestra si graph no está vacío */}
      {!graph ? (
        
        <div style={{ width: "80%", marginBottom: "20px" }}>
          <h2>Métricas de Commits con Cobertura de Código</h2>

          <Bubble data={{
              datasets: commits.slice().reverse().map((commit, index) => {
                const job = jobsByCommit.find(job => job.sha === commit.sha);
                const backgroundColor = getColorByConclusion(job?.conclusion || "failed", commit.coverage);

                return {
                  label: `Commit ${index + 1}`,
                  data: [{
                    x: index + 1,
                    y: commit.test_count,
                    r: Math.max(10, commit.stats.total / 1.5), // Tamaño de la burbuja
                  }],
                  backgroundColor,
                  borderColor: `rgba(0,0,0,0.2)`, // Borde tenue
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
                  title: { display: true, text: "Total número de tests" },
                  min: 0,
                  max: maxTest + 6,
                  suggestedMax: 80
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
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "35px", justifyContent: "space-between", marginBottom: "30px" }}>
              <div style={{ width: "30%" }} onClick={() => changeGraph("Total Número de Tests")}>
                <h3>Total Número de Tests</h3>
                <Line
                  data={getLineChartData("Total Número de Tests", commits.map(commit => commit.test_count))}
                  options={getChartOptions("Número de Tests")}
                  ref={chartRefTestCount}
                />
              </div>
              <div style={{ width: "30%" }} onClick={() => changeGraph("Cobertura de Código")}>
                <h3>Cobertura de Código</h3>
                <Line
                  data={getLineChartData("Porcentaje de Cobertura de Código", commits.map(commit => commit.coverage))}
                  options={getChartOptions("Cobertura de Código")}
                  ref={chartRefCoverage}
                />
              </div>
              <div style={{ width: "30%" }} onClick={() => changeGraph("Líneas de Código Modificadas")}>
                <h3>Líneas de Código Modificadas</h3>
                <Line
                  data={getLineChartData("Total de Líneas de Código Modificadas", commits.map(commit => commit.stats.total))}
                  options={getChartOptions("Líneas de Código Modificadas")}
                  ref={chartRefModifiedLines}
                />
              </div>
            </div>
          </div>
        </div>

      ) : null}

      <div style={{
        display: "flex",
        alignItems: "center",
        marginTop: "-700px",
        marginLeft: "1200px"
      }}>
        <div style={{
          width: "40px",
          height: "400px",
          background: "linear-gradient(to bottom, rgba(0,150,0,1), rgba(0,255,0,0))",
          textAlign: "center",
          position: "relative"
        }}>
          <p style={{ marginTop: '-30px', color: "#000", fontWeight: "bold", justifyContent:"center"}}> Cobertura</p>
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


      {/* Solo muestra el gráfico de métricas si hay una selección */}
      {graph && (
        <TDDLineCharts port={port} role={role} filteredCommitsObject={commits} jobsByCommit={jobsByCommit} optionSelected={graph}/>
      )}
    </div>

  );
};

export default TDDBoard;
