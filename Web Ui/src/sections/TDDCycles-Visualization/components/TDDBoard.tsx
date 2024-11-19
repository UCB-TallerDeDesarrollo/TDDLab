import React, { useRef, useState, useEffect } from "react";
import { Bubble, getElementAtEvent, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { GithubAPIRepository } from "../../../modules/TDDCycles-Visualization/domain/GithubAPIRepositoryInterface";
import TDDLineCharts from "./TDDLineChart";
import { Button } from "@mui/material";
import TDDPie from "./graficas_prueba/TDDPie"; //IMPORTAMOS EL TDDPie


ChartJS.register(
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

interface CycleReportViewProps {
  commits: CommitDataObject[];
  jobsByCommit: JobDataObject[];
  port: GithubAPIRepository;
  role: string;
}

const TDDBoard: React.FC<CycleReportViewProps> = ({
  commits,
  jobsByCommit,
  role,
  port,
}) => {
  const chartRefCoverage = useRef<any>();
  const chartRefModifiedLines = useRef<any>();
  const chartRefTestCount = useRef<any>();
  const [graph, setGraph] = useState<string>("");
  const testCounts = commits.map((commit) => commit.test_count);
  const testCountsColor = commits.map((commit) => commit.coverage);
  const minTestCount = 0;
  const maxTestCount = Math.max(...testCountsColor);
  const maxTest = Math.max(...testCounts);
  const numberOfLabels = 3;
  const step = Math.ceil((maxTestCount - minTestCount) / numberOfLabels);
  const labels = Array.from(
    { length: numberOfLabels },
    (_, i) => maxTestCount - i * step
  );

  const getColorByCoverage = (testCountsColor: number) => {
    let greenValue;
    let opacity = 2;

    if (testCountsColor >= labels[1] && testCountsColor <= labels[0]) {
      greenValue = 110;
    } else if (testCountsColor >= labels[2] && testCountsColor < labels[1]) {
      greenValue = 110;
      opacity = 0.5;

    } else if (testCountsColor < labels[2]) {
      greenValue = 110;
      opacity = 0.2;
    }

    return `rgba(0, ${greenValue}, 0, ${opacity})`;
  };

  const getColorByConclusion = (conclusion: string, coverage: number) => {
    if (conclusion === "success") {
      return getColorByCoverage(coverage);
    } else if (conclusion === "failed") {

      return "black";
    }
    else { return 'red' }
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
              padding: { top: 20 },
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
      datasets: [
        {
          label,
          data: data.reverse(),
          backgroundColor: commits
            .map((commit) => {
              const job = jobsByCommit.find((job) => job.sha === commit.sha);
              if (job?.conclusion === "success") return "green";
              else if (job === undefined) return "black";
              else return "red";
            })
            .reverse(),
          borderColor: "rgba(0, 0, 0, 0.2)",
          links: commits.map((commit) => commit.html_url).reverse(),
        },
      ],
    };
  };
  const chartRef = useRef<any>();

  const onClick = (event: any) => {
    const elements = getElementAtEvent(chartRef.current, event);
    if (elements.length > 0) {
      const dataSetIndexNum = elements[0]
        .datasetIndex;
    
      const commit = commits.slice().reverse()[dataSetIndexNum];
      commit?.html_url && window.open(commit.html_url, "_blank");
    }
  };
  useEffect(() => {
  
  }, [graph]);

  return (
    <>

      {!graph ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "85%", marginBottom: "20px" }}>
            <h2>Métricas de Commits con Cobertura de Código</h2>

            <Bubble
              ref={chartRef}
              onClick={onClick}
              data={{
                datasets: commits
                  .slice()
                  .reverse()
                  .map((commit, index) => {
                    const job = jobsByCommit.find((job) => job.sha === commit.sha);
                    const backgroundColor = getColorByConclusion(
                      job?.conclusion || "failed",
                      commit.coverage
                    );

                    return {
                      label: `Commit ${index + 1}`,
                      data: [
                        {
                          x: index + 1,
                          y: commit.test_count,
                          r: Math.max(10, commit.stats.total / 1.5),
                        },
                      ],
                      backgroundColor,
                      borderColor: `rgba(0,0,0,0.2)`,
                    };
                  }),
              }}
              options={{
                scales: {
                  x: {
                    title: { display: true, text: "Commits" },
                    ticks: {
                      callback: (value: any) => `Commit ${value}`,
                    },
                  },
                  y: {
                    title: { display: true, text: "Total número de tests" },
                    min: 0,
                    max: maxTest + 6,
                    suggestedMax: 80,
                  },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem: any) => {
                        const reversedCommits = commits.slice().reverse();
                        const index = tooltipItem.raw.x - 1;
                        const commit = reversedCommits[index];
                        const commitNumber = index + 1;
                        return [
                          `Commit ${commitNumber}: ${commit.commit.message}`,
                          `Líneas Modificadas: ${commit.stats.additions}`,
                          `Líneas Eliminadas: ${commit.stats.deletions}`,
                          `Cobertura: ${commit.coverage}%`,
                          `Total de Tests: ${commit.test_count}`,
                        ];
                      },
                    },
                  },
                },
              }}
            />;

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "35px",
                justifyContent: "space-between",
                marginBottom: "30px",
              }}
            >
              {/* Tus otros gráficos AGREGAMOS ESTO PARA PROBAR EL GRAFICO PASTEL EN EL DASHBOARD*/}
              <div style={{ width: "30%" }}>
                <TDDPie commits={commits} />
              </div>

              <div
                style={{ width: "30%" }}
                onClick={() => changeGraph("Total Número de Tests")}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    changeGraph("Líneas de Código Modificadas");
                  }
                }}
                role="button"
              >
                <h3>Total Número de Tests</h3>
                <Line
                  data={getLineChartData(
                    "Total Número de Tests",
                    commits.map((commit) => commit.test_count)
                  )}
                  options={getChartOptions("Número de Tests")}
                  ref={chartRefTestCount}
                />
              </div>
              <div
                style={{ width: "30%" }}
                onClick={() => changeGraph("Cobertura de Código")}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    changeGraph("Líneas de Código Modificadas");
                  }
                }}
                role="button"
              >
                <h3>Cobertura de Código</h3>
                <Line
                  data={getLineChartData(
                    "Porcentaje de Cobertura de Código",
                    commits.map((commit) => commit.coverage)
                  )}
                  options={getChartOptions("Cobertura de Código")}
                  ref={chartRefCoverage}
                />
              </div>
              <div
                style={{ width: "30%" }}
                onClick={() => changeGraph("Líneas de Código Modificadas")}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    changeGraph("Líneas de Código Modificadas");
                  }
                }}
                role="button"
              >
                <h3>Líneas de Código Modificadas</h3>
                <Line
                  data={getLineChartData(
                    "Total de Líneas de Código Modificadas",
                    commits.map((commit) => commit.stats.total)
                  )}
                  options={getChartOptions("Líneas de Código Modificadas")}
                  ref={chartRefModifiedLines}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "absolute",
              top: "65%", 
              right: "9%",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "400px", //fix
                background:
                  "linear-gradient(to bottom, rgba(0,150,0,1), rgba(0,255,0,0))",
                textAlign: "center",
                position: "relative",
              }}
            >
              <p
                style={{
                  marginTop: "-30px",
                  color: "#000",
                  fontWeight: "bold",
                  justifyContent: "center",
                  alignContent: "center",
                }}
              >
                {" "}
                Cobertura
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "300px",
                marginLeft: "10px",
                fontSize: "12px",
                color: "#000",
                marginBottom:"90px"
              }}
            >
              {labels.map((label) => (
                <p key={label} style={{ margin: 0 }}>
                  {label}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {graph && (
        <>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              onClick={() => setGraph("")}
              style={{
                backgroundColor: "#052845",
                color: "#fff",
                marginTop: "20px",
                marginBottom: "20px",
                width: "20%",
                padding: "8px 16px",
                borderRadius: "4px",
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              Volver al Dashboard
            </Button>
          </div>
          <TDDLineCharts
            port={port}
            role={role}
            filteredCommitsObject={commits}
            jobsByCommit={jobsByCommit}
            optionSelected={graph}
          />
        </>

      )}
    </>
  );
};

export default TDDBoard;