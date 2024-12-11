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
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Button 
} from "@mui/material";

import FileUploadDialog from "../../Assignments/components/FileUploadDialog";
import handleUploadFile from "../../Assignments/AssignmentDetail";



import { VITE_API } from "../../../../config";

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
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<CommitDataObject | null>(null);
  const [commitTimelineData, setCommitTimelineData] = useState<any[]>([]);
  const chartRefCoverage = useRef<any>();
  const chartRefModifiedLines = useRef<any>();
  const chartRefTestCount = useRef<any>();
  const [graph, setGraph] = useState<string>("");
  const testCounts = commits.map((commit) => commit.test_count);
  const testCountsColor = commits.map((commit) => commit.coverage);
  const minTestCount = 0;
  const maxTestCount = Math.max(...testCountsColor);
  const maxTest = Math.max(...testCounts);
  const numberOfLabels = 4;
  const step = Math.ceil((maxTestCount - minTestCount) / numberOfLabels);
  const labels = Array.from(
    { length: numberOfLabels },
    (_, i) => maxTestCount - i * step
  );

  const handleOpenFileDialog = () => {
    setIsFileDialogOpen(true);
  };
  
  const handleCloseFileDialog = () => {
    setIsFileDialogOpen(false);
  };

  const handleUploadFileWrapper = async (file: any) => {
    try {
      await handleUploadFile(file);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  
  <FileUploadDialog
    open={isFileDialogOpen}
    onClose={handleCloseFileDialog}
    onUpload={handleUploadFileWrapper} // Envía esta función
  />
  

  const getColorByCoverage = (testCountsColor: number) => {
    let greenValue;
    let opacity = 2;
    console.log(labels[3])
    if (testCountsColor >= labels[1]) {
      greenValue = 110;
  } else if (testCountsColor < labels[1] && testCountsColor >= labels[2]) {
      greenValue = 110;
      opacity = 0.5;
  } else if (testCountsColor < labels[2] && testCountsColor >= labels[3]) {
      greenValue = 110;
      opacity = 0.6;
  } else if(testCountsColor < labels[3]) {
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
    localStorage.setItem("selectedMetric", graphText);
    window.location.reload();
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
          data: [...data].reverse(),
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

  const onClick = async (event: any) => {
    const elements = getElementAtEvent(chartRef.current, event);
    if (elements.length > 0) {
      const dataSetIndexNum = elements[0].datasetIndex;
      const commit = commits.slice().reverse()[dataSetIndexNum];
      if (commit?.html_url) {
        const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/commit\/([^/]+)/;
        const match = commit.html_url.match(regex);
  
        if (match) {
          const repoOwner = match[1];
          const repoName = match[2];
          const sha = match[3];
  
          try {
            const response = await fetch(
              `${VITE_API}/TDDCycles/commit-timeline?sha=${sha}&repoName=${repoName}&owner=${repoOwner}`
            );
  
            if (response.ok) {
              const data = await response.json();
              setCommitTimelineData(data); 
              setSelectedCommit(commit); 
              setOpenModal(true); 
            } else {
              console.error("Error al obtener los datos:", response.statusText);
            }
          } catch (error) {
            console.error("Error al llamar a la API:", error);
          }
        }
      }
    }
  };
  
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCommit(null);
  };
  
  useEffect(() => {
  
  }, [graph]);

  const [barraHeight, setBarraHeight] = useState(window.innerWidth / 3);

  useEffect(() => {
    const actualizarAltura = () => {
      setBarraHeight(window.innerWidth / 3);
    };

    // Agregamos el listener de redimensionamiento
    window.addEventListener('resize', actualizarAltura);

    // Llamamos una primera vez para configurar la altura inicial
    actualizarAltura();

    // Limpiamos el listener cuando el componente se desmonte
    return () => window.removeEventListener('resize', actualizarAltura);
  }, []);
  

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
          <div style={{ width: "85%", marginBottom: "20px",marginRight:"20px", position: 'relative' }}>
            <h2>Métricas de Commits con Cobertura de Código</h2>
              <div
                style={{
                  position: "absolute",
                  right: -230,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
              <div
                style={{
                  width: "20px",
                  height: `${barraHeight}px`, // Altura dinámica ajustada
                  transform:  'translateX(-655%) translateY(6%)',
                  background: "linear-gradient(to bottom, rgba(0,150,0,1), rgba(0,255,0,0))",
                  textAlign: "center",
                  display: "flex",
                }}
              >
              <p
                style={{
                  transform: 'translateX(-33%) translateY(-18%)',
                  color: "#000",

                  fontWeight: "bold",
                }}
              >
                Cobertura
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                transform:
                  labels.includes(0) 
                    ? "translateX(-1700%) translateY(3%)"
                    : "translateX(-599%) translateY(3%)",
                justifyContent: "space-between",
                height: `${barraHeight * 0.93}px`,
                fontSize: "12px",
                color: "#000",
              }}
            >
              {labels.map((label) => (
                <p key={label} style={{ margin: 0 }}>
                  {label}
                </p>
              ))}
            </div>

            </div>

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
                      callback: (_: any,index: number) => `Commit ${index + 1}`, 
                      stepSize: 1, 
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
            <Dialog
              open={openModal}
              onClose={handleCloseModal}
              aria-labelledby="commit-details-dialog"
              fullWidth
              maxWidth="sm"
              sx={{
                "& .MuiDialog-paper": {
                  padding: "25px",
                  borderRadius: "10px",
                },
              }}
            >
              <DialogTitle 
                id="commit-details-dialog"
                style={{textAlign: "center", fontSize:"2em", fontWeight:"bold"}}>
                  {`Timeline del commit ${commits.length - commits.findIndex((commit) => commit.sha === selectedCommit?.sha)} `}
              </DialogTitle>
              <DialogContent>
              {selectedCommit?.commit?.message && (
                <div style={{ textAlign: "center", marginBottom: "10px" }}>
                  <div style={{fontFamily:"monospace", fontSize: "1.25em", marginBottom: "10px"}}>
                    ({selectedCommit?.sha})
                  </div>
                </div>
              )}
                {commitTimelineData.length > 0 ? (
                  <div>
                    <div style={{ width: "100%", height: "300px"}}>
                      <Bubble
                        data={{
                          datasets: [
                            {
                              label: "Ejecución",
                              data: commitTimelineData.map((item, index) => ({
                                x: index + 1,
                                y: 1,
                                r: 15, 
                                backgroundColor: item.color === "green" ? "#28A745" : "#D73A49", 
                                borderColor: item.color === "green" ? "#28A745" : "#D73A49",
                                numTests: item.number_of_tests,
                                passedTests: item.passed_tests, 
                              })),
                              backgroundColor: commitTimelineData.map((item) =>
                                item.color === "green" ? "#28A745" : "#D73A49"
                              ),
                              borderColor: commitTimelineData.map((item) =>
                                item.color === "green" ? "#28A745" : "#D73A49"
                              ),
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          scales: {
                            x: {
                              title: {
                                display: true,
                              },
                              ticks: {
                                display: false, 
                              },
                            },
                            y: {
                              title: {
                                display: true,
                              },
                              ticks: {
                                display: false, 
                              },
                              min: 0.5,
                              max: 1.5, 
                            },
                          },
                          plugins: {
                            legend: { display: false }, 
                            tooltip: {
                              enabled: true,
                              callbacks: {
                                label: function (context: any) {
                                  const dataPoint = context.raw;
                                  return [
                                    `Number of Tests: ${dataPoint.numTests}`,
                                    `Passed Tests: ${dataPoint.passedTests}`,
                                  ];
                                },
                              },
                            },
                          },
                          elements: {
                            point: {
                              backgroundColor: (context: any) =>
                                context.raw.backgroundColor, 
                              borderColor: (context: any) =>
                                context.raw.borderColor, 
                              hoverBackgroundColor: (context: any) =>
                                context.raw.backgroundColor, 
                              hoverBorderColor: (context: any) =>
                                context.raw.borderColor, 
                              hoverRadius: 8, 
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  
                ) : (
                  <div>
      <p style={{ textAlign: "center", margin: "2em 0px 2em 0px" }}>
        No hay un registro de ejecución vinculante para este commit.
      </p>
      <div style={{ textAlign: "center", marginTop: "1em" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenFileDialog}
        >
          Subir Sesión TDD
        </Button>
      </div>
      <FileUploadDialog
        open={isFileDialogOpen}
        onClose={handleCloseFileDialog}
        onUpload={handleUploadFileWrapper}
      />
    </div>
                    
                )}
                {selectedCommit?.commit?.message && (
                <div style={{ textAlign: "center", marginBottom: "10px" }}>
                  <strong>Mensaje:</strong> 
                  <span style={{ fontStyle: "italic" }}>
                    {selectedCommit.commit.message}
                  </span>
                </div>
              )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseModal} color="primary">
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    if (selectedCommit?.html_url) {
                      window.open(selectedCommit.html_url, "_blank");
                    }
                  }}
                  color="primary"
                  variant="contained"
                >
                  Ir al Commit
                </Button>
              </DialogActions>
            </Dialog>



            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "35px",
                justifyContent: "space-between",
                marginBottom: "30px",
              }}
            >
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
          <div>
          </div>
        </div>
      ) : null}

      {graph && (
        <>
          <TDDLineCharts
            port={port}
            role={role}
            filteredCommitsObject={commits}
            jobsByCommit={jobsByCommit}
            optionSelected={graph}
            complexity={null}
            commitsCycles= {null}
          />
        </>

      )}
    </>
  );
};

export default TDDBoard;
