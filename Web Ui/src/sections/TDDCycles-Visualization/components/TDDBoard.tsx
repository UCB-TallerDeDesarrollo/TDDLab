import React, { useRef, useState, useEffect, useMemo } from "react";
import { Bubble, getElementAtEvent, Line } from "react-chartjs-2";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import TDDLineCharts from "./TDDLineChart";

import { VITE_API } from "../../../../config";
import CommitTimelineDialog from "./TDDCommitTimelineDialog";
import TDDCycleChart from "./TDDCycleChart";
import { ProcessedTDDLogs, ProcessedCommit, ProcessedTest } from '../../../modules/TDDCycles-Visualization/domain/ProcessedTDDLogInterfaces';

interface CycleReportViewProps {
  commits: CommitDataObject[];
  processedTddLogs: ProcessedTDDLogs | null;
  port: CommitHistoryRepository;
  role: string;
}

interface CommitTestsMapping {
  commitNumber: number;
  commitData: ProcessedCommit;
  tests: ProcessedTest[];
}

const preprocessProcessedLogs = (processedLogs: ProcessedTDDLogs | null): CommitTestsMapping[] => {
  if (!processedLogs || !processedLogs.commits || processedLogs.commits.length === 0) {
    return [];
  }
  
  return processedLogs.commits.map((commit) => {
    return {
      commitNumber: commit.commitNumber,
      commitData: commit,
      tests: commit.tests
    };
  });
};

const TDDBoard: React.FC<CycleReportViewProps> = ({
  commits,
  processedTddLogs,
  role,
  port,
}) => {
  // 1. CREAMOS UNA VERSIÓN ORDENADA (Oldest -> Newest)
  // Esto invierte el array original para que la posición 0 sea el "Initial Commit".
  const sortedCommits = useMemo(() => {
    return [...commits].reverse();
  }, [commits]);

  const processedTDDLogs = useMemo(() => {
    return preprocessProcessedLogs(processedTddLogs);
  }, [processedTddLogs]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<CommitDataObject | null>(null);
  const [commitTimelineData, setCommitTimelineData] = useState<any[]>([]);
  
  // Referencias a las gráficas
  const chartRefCoverage = useRef<any>();
  const chartRefModifiedLines = useRef<any>();
  const chartRefTestCount = useRef<any>();
  const chartRef = useRef<any>(); 

  const [graph, setGraph] = useState<string>("");
  
  // Usamos sortedCommits para los cálculos de máximos
  const testCounts = sortedCommits.map((commit) => commit.test_count);
  const minTestCount = 0;
  const maxTestCount = 100;
  const maxTest = Math.max(...testCounts);
  const numberOfLabels = 4;
  const step = Math.ceil((maxTestCount - minTestCount) / numberOfLabels);
  const labels = Array.from(
    { length: numberOfLabels },
    (_, i) => maxTestCount - i * step
  );

  const getTestsForCommit = (commitNumber: number): ProcessedTest[] => {
    const mapping = processedTDDLogs.find(m => m.commitNumber === commitNumber);
    return mapping ? mapping.tests : [];
  };
  
  function containsRefactor(commitMessage: string): boolean {
    const regex = /\brefactor(\w*)\b/i;
    return regex.test(commitMessage);
  }

  const getCommitColor = (commit: CommitDataObject): string => {
    if (!commit || typeof commit !== "object" || !commit.commit || typeof commit.commit.message !== "string") {
      return "red";
    }
    
    const { coverage, test_count, conclusion, commit: { message } } = commit;
    
    if (coverage === undefined || coverage === null) {
      return "black";
    }

    if (test_count === undefined || test_count === 0 || conclusion === "failure") {
      return "red";
    }
    const isRefactor = containsRefactor(message);
    return getColorByCoverage(coverage, isRefactor);
  };
  
  const getColorByCoverage = (coverage: number, isRefactor: boolean): string => {
    let colorValue: number;
    let opacity: number;
    const baseColor = isRefactor ? 'blue' : 'green';
  
    if (coverage >= 90) { colorValue = 110; opacity = 1; } 
    else if (coverage >= 80) { colorValue = 110; opacity = 0.8; } 
    else if (coverage >= 70) { colorValue = 110; opacity = 0.6; } 
    else if (coverage >= 60) { colorValue = 110; opacity = 0.4; } 
    else { colorValue = 110; opacity = 0.2; }
  
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
            font: { size: 13, lineHeight: 1.2 },
          },
        },
        y: {
          title: {
            display: true,
            text: yAxisText,
            font: { size: 10, lineHeight: 1.2, padding: { top: 20 } },
          },
        },
      },
      plugins: {
        legend: { display: true },
      },
    };
  };

  // 2. CORREGIDO: getLineChartData ahora asume que recibe los datos ya ordenados (sortedCommits)
  // Eliminamos los .reverse() internos que causaban confusión
  const getLineChartData = (label: string, data: number[]) => {
    return {
      labels: sortedCommits.map((_, index) => `Commit ${index + 1}`),
      datasets: [
        {
          label,
          data: data, // Ya vienen ordenados
          backgroundColor: sortedCommits.map((commit) => getCommitColor(commit)),
          borderColor: "rgba(0, 0, 0, 0.2)",
          links: sortedCommits.map((commit) => commit.html_url),
        },
      ],
    };
  };

  const onClick = async (event: any) => {
    const elements = getElementAtEvent(chartRef.current, event);
    if (elements.length > 0) {
      const dataSetIndexNum = elements[0].datasetIndex;
      
      // 3. CORREGIDO: Usamos sortedCommits directamente.
      // El índice en el gráfico ahora coincide con el índice en sortedCommits
      const commit = sortedCommits[dataSetIndexNum];
      
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
              
              // 4. CORREGIDO: Cálculo del número de commit.
              // Como sortedCommits va de Antiguo (0) a Nuevo (N), 
              // el Commit #1 es el índice 0 + 1.
              const commitNumberForLogs = dataSetIndexNum + 1;
              const testsForCommit = getTestsForCommit(commitNumberForLogs);

              console.log(`Commit seleccionado UI Index: ${dataSetIndexNum}`);
              console.log(`Commit Number calculado: ${commitNumberForLogs}`);
              console.log(`Tests encontrados:`, testsForCommit);

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
    window.addEventListener('resize', actualizarAltura);
    actualizarAltura();
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
            {/* ... (código de la barra lateral sin cambios, omitido por brevedad) ... */}
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
                  height: `${barraHeight}px`,
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
                // 6. CORREGIDO: Usamos sortedCommits directamente
                datasets: sortedCommits
                  .map((commit, index) => {
                    const backgroundColor = getCommitColor(commit);
                    return {
                      label: `Commit ${index + 1}`,
                      data: [
                        {
                          x: index + 1, // Commit 1 es X=1
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
                        const dataLength = sortedCommits.length;
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
                        // 7. CORREGIDO: Tooltip usa sortedCommits
                        const index = tooltipItem.raw.x - 1;
                        const commit = sortedCommits[index];
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
            />
            <CommitTimelineDialog
              open={openModal}
              handleCloseModal={handleCloseModal}
              selectedCommit={selectedCommit}
              commitTimelineData={commitTimelineData}
              commits={sortedCommits} 
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
              {/* 8. CORREGIDO: Pasamos datos basados en sortedCommits a las gráficas lineales */}
              <div
                style={{ width: "30%" }}
                onClick={() => changeGraph("Total Número de Tests")}
                role="button"
                tabIndex={0}
              >
                <h3>Total Número de Tests</h3>
                <Line
                  data={getLineChartData(
                    "Total Número de Tests",
                    sortedCommits.map((commit) => commit.test_count)
                  )}
                  options={getChartOptions("Número de Tests")}
                  ref={chartRefTestCount}
                />
              </div>
              <div
                style={{ width: "30%" }}
                onClick={() => changeGraph("Cobertura de Código")}
                role="button"
                tabIndex={0}
              >
                <h3>Cobertura de Código</h3>
                <Line
                  data={getLineChartData(
                    "Porcentaje de Cobertura de Código",
                    sortedCommits.map((commit) => commit.coverage ?? 0)
                  )}
                  options={getChartOptions("Cobertura de Código")}
                  ref={chartRefCoverage}
                />
              </div>
              <div
                style={{ width: "30%" }}
                onClick={() => changeGraph("Líneas de Código Modificadas")}
                role="button"
                tabIndex={0}
              >
                <h3>Líneas de Código Modificadas</h3>
                <Line
                  data={getLineChartData(
                    "Total de Líneas de Código Modificadas",
                    sortedCommits.map((commit) => commit.stats.total)
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
            filteredCommitsObject={sortedCommits} // Usar el array ordenado también aquí
            optionSelected={graph}
            commitsCycles={null} 
            processedTddLogs={processedTddLogs}
            />
        </>

      )}
      <TDDCycleChart data={processedTddLogs} />
    </>    
  );
};

export default TDDBoard;