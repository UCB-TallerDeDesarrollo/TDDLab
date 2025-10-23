import React, { useRef, useState, useEffect, useMemo  } from "react";
import { Bubble, getElementAtEvent, Line } from "react-chartjs-2";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import TDDLineCharts from "./TDDLineChart";

import { VITE_API } from "../../../../config";
import CommitTimelineDialog from "./TDDCommitTimelineDialog";
import { TDDLogEntry, TestExecutionLog, CommitLog } from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import TDDCycleChart from "./TDDCycleChart";

interface CycleReportViewProps {
  commits: CommitDataObject[];
  tddLogs: TDDLogEntry[];
  port: CommitHistoryRepository;
  role: string;
}

interface CommitTestsMapping {
  commitIndex: number;
  commitData: CommitLog | null;
  tests: TestExecutionLog[];
}

const preprocessTDDLogs = (tddLogs: TDDLogEntry[]): CommitTestsMapping[] => {
  if (!tddLogs || tddLogs.length === 0) {
    return [];
  }
  
  const commitMappings: CommitTestsMapping[] = [];
  let currentCommitIndex = -1;
  let currentTests: TestExecutionLog[] = [];
  let currentCommitData: CommitLog | null = null;
  
  tddLogs.forEach((log) => {
    // Si es un commit, guardamos los tests del commit anterior (si existen)
    if ('commitId' in log) {
      if (currentCommitIndex >= 0 && currentTests.length > 0) {
        commitMappings.push({
          commitIndex: currentCommitIndex,
          commitData: currentCommitData,
          tests: [...currentTests]
        });
      }
      
      // Iniciamos un nuevo commit
      currentCommitIndex++;
      currentCommitData = log as CommitLog;
      currentTests = [];
    }
    // Si es una ejecución de tests, la agregamos al commit actual
    else if ('numPassedTests' in log) {
      currentTests.push(log as TestExecutionLog);
    }
  });
  
  // No olvidar agregar el último commit si tiene tests
  if (currentCommitIndex >= 0 && currentTests.length > 0) {
    commitMappings.push({
      commitIndex: currentCommitIndex,
      commitData: currentCommitData,
      tests: [...currentTests]
    });
  }
  
  return commitMappings;
};

const TDDBoard: React.FC<CycleReportViewProps> = ({
  commits,
  tddLogs,
  role,
  port,
}) => {
  const processedTDDLogs = useMemo(() => {
    return preprocessTDDLogs(tddLogs);
  }, [tddLogs]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<CommitDataObject | null>(null);
  const [commitTimelineData, setCommitTimelineData] = useState<any[]>([]);
  const chartRefCoverage = useRef<any>();
  const chartRefModifiedLines = useRef<any>();
  const chartRefTestCount = useRef<any>();
  const [graph, setGraph] = useState<string>("");
  const testCounts = commits.map((commit) => commit.test_count);
  const minTestCount = 0;
  const maxTestCount = 100;
  const maxTest = Math.max(...testCounts);
  const numberOfLabels = 4;
  const step = Math.ceil((maxTestCount - minTestCount) / numberOfLabels);
  const labels = Array.from(
    { length: numberOfLabels },
    (_, i) => maxTestCount - i * step
  );

  const getTestsForCommit = (commitIndex: number): TestExecutionLog[] => {
    // Buscar el commit en los logs preprocesados por índice
    const commitMapping = processedTDDLogs.find(
      mapping => mapping.commitIndex === commitIndex
    );
    
    return commitMapping ? commitMapping.tests : [];
  };
  
  function containsRefactor(commitMessage: string): boolean {
    const regex = /\brefactor(\w*)\b/i;
    return regex.test(commitMessage);
  }

  // Nueva función para obtener el color basado directamente en el commit
  const getCommitColor = (commit: CommitDataObject): string => {
    if (
    !commit || typeof commit !== "object" ||
    !commit.commit || typeof commit.commit.message !== "string"
    ) {
    return "red";
    }
    
    const { coverage, test_count, conclusion, commit: { message } } = commit;
    
    // Si no hay información de cobertura o tests, asumimos que el commit no pasó
     if (
    coverage === undefined || coverage === null
    ) {
      return "black";
    }

     // Casos de error: sin cobertura, sin tests o tests fallidosAdd commentMore actions
    if (
    test_count === undefined || test_count === 0 ||
    conclusion === "failure"
    ) {
      return "red";
    }
    const isRefactor = containsRefactor(message);
    // Si tiene tests y no hay errores (asumimos que en commit-history.json solo se guardan commits válidos)
    return getColorByCoverage(coverage, isRefactor);
  };
  
  const getColorByCoverage = (coverage: number, isRefactor: boolean): string => {
    let colorValue: number;
    let opacity: number;
    const baseColor = isRefactor ? 'blue' : 'green';
  
    if (coverage >= 90) {
      colorValue = 110;
      opacity = 1;
    } else if (coverage >= 80) {
      colorValue = 110;
      opacity = 0.8;
    } else if (coverage >= 70) {
      colorValue = 110;
      opacity = 0.6;
    } else if (coverage >= 60) {
      colorValue = 110;
      opacity = 0.4;
    } else {
      colorValue = 110;
      opacity = 0.2;
    }
  
    return baseColor === 'green'
      ? `rgba(0, ${colorValue}, 0, ${opacity})`
      : `rgba(0, 100, 255, ${opacity})`;
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
              return getCommitColor(commit);
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
              await response.json();
              // Filtrar los tests del commit específico usando el tdd_log.json local
              const commitIndexInOriginal = dataSetIndexNum - 1;
              const testsForCommit = getTestsForCommit(commitIndexInOriginal);

              setCommitTimelineData(testsForCommit); 
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
                    const backgroundColor = getCommitColor(commit);

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
                      callback: (_: any, index: number) => {
                        const dataLength = commits.length;
                        if (dataLength === 1) {
                          return `Commit ${index}`;
                        }
                        return `Commit ${index + 1}`;
                      },
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
            <CommitTimelineDialog
              open={openModal}
              handleCloseModal={handleCloseModal}
              selectedCommit={selectedCommit}
              commitTimelineData={commitTimelineData}
              commits={commits}
            />
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
                    commits.map((commit) => commit.coverage ?? 0)
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
            tddLogs={tddLogs}
            optionSelected={graph}
            complexity={null}
            commitsCycles= {null}
          />
        </>

      )}
      <TDDCycleChart data={tddLogs} />
    </>    
  );
};

export default TDDBoard;