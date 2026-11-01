import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bubble, getElementAtEvent, Line } from "react-chartjs-2";

import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import {
  TDDLogEntry,
  TestExecutionLog,
} from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";

import TDDLineCharts from "./TDDLineChart";
import CommitTimelineDialog from "./TDDCommitTimelineDialog";
import TDDCycleChart from "./TDDCycleChart";

interface CycleReportViewProps {
  commits: CommitDataObject[];
  tddLogs: TDDLogEntry[];
  port: CommitHistoryRepository;
  role: string;
}

type Metric =
  | "Total Número de Tests"
  | "Cobertura de Código"
  | "Líneas de Código Modificadas";

/**
 * El backend asocia las ejecuciones acumuladas antes de cada
 * registro de commit con el SHA de ese commit.
 *
 * Las ejecuciones posteriores al último commit no se asignan
 * artificialmente a un commit anterior.
 */
function preprocessTDDLogs(
  logs: TDDLogEntry[],
): Map<string, TestExecutionLog[]> {
  const testsByCommit = new Map<string, TestExecutionLog[]>();
  let pendingTests: TestExecutionLog[] = [];

  for (const log of logs) {
    if ("commitId" in log) {
      const sha = log.commitId.trim().toLowerCase();

      if (sha) {
        const previousTests = testsByCommit.get(sha) ?? [];

        testsByCommit.set(sha, [
          ...previousTests,
          ...pendingTests,
        ]);
      }

      pendingTests = [];
    } else if ("numPassedTests" in log) {
      pendingTests.push(log);
    }
  }

  return testsByCommit;
}

function containsRefactor(message: string): boolean {
  return /\brefactor(\w*)\b/i.test(message);
}

function getColorByCoverage(
  coverage: number,
  isRefactor: boolean,
): string {
  let opacity: number;

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

  return isRefactor
    ? `rgba(0, 100, 255, ${opacity})`
    : `rgba(0, 110, 0, ${opacity})`;
}

function getCommitColor(commit: CommitDataObject): string {
  if (
    !commit ||
    !commit.commit ||
    typeof commit.commit.message !== "string"
  ) {
    return "red";
  }

  const {
    coverage,
    test_count,
    conclusion,
    commit: { message },
  } = commit;

  if (coverage === undefined || coverage === null) {
    return "black";
  }

  if (
    test_count === undefined ||
    test_count === 0 ||
    conclusion === "failure"
  ) {
    return "red";
  }

  return getColorByCoverage(
    coverage,
    containsRefactor(message),
  );
}

function getChartOptions(yAxisText: string) {
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
}

const TDDBoard: React.FC<CycleReportViewProps> = ({
  commits,
  tddLogs,
  role,
  port,
}) => {
  const [openModal, setOpenModal] = useState(false);

  const [selectedCommit, setSelectedCommit] =
    useState<CommitDataObject | null>(null);

  const [commitTimelineData, setCommitTimelineData] =
    useState<TestExecutionLog[]>([]);

  const [graph, setGraph] = useState<Metric | "">("");

  const [barraHeight, setBarraHeight] = useState(
    window.innerWidth / 3,
  );

  const chartRef = useRef<any>(null);

  const testsByCommit = useMemo(
    () => preprocessTDDLogs(tddLogs),
    [tddLogs],
  );

  const chronologicalCommits = useMemo(
    () => [...commits].reverse(),
    [commits],
  );

  const maxTest = useMemo(
    () =>
      Math.max(
        0,
        ...commits.map((commit) =>
          Number.isFinite(commit.test_count)
            ? commit.test_count
            : 0,
        ),
      ),
    [commits],
  );

  const coverageLabels = [100, 75, 50, 25, 0];

  useEffect(() => {
    const actualizarAltura = () => {
      setBarraHeight(window.innerWidth / 3);
    };

    actualizarAltura();
    window.addEventListener("resize", actualizarAltura);

    return () => {
      window.removeEventListener(
        "resize",
        actualizarAltura,
      );
    };
  }, []);

  // Evita conservar un modal con datos de una consulta anterior.
  useEffect(() => {
    setOpenModal(false);
    setSelectedCommit(null);
    setCommitTimelineData([]);
  }, [commits, tddLogs]);

  const changeGraph = (metric: Metric) => {
    localStorage.setItem("selectedMetric", metric);
    setGraph(metric);
  };

  const handleMetricKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    metric: Metric,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      changeGraph(metric);
    }
  };

  const getLineChartData = (
    label: string,
    getValue: (commit: CommitDataObject) => number,
  ) => ({
    labels: chronologicalCommits.map(
      (_, index) => `Commit ${index + 1}`,
    ),
    datasets: [
      {
        label,
        data: chronologicalCommits.map(getValue),
        backgroundColor:
          chronologicalCommits.map(getCommitColor),
        borderColor: "rgba(0, 0, 0, 0.2)",
        links: chronologicalCommits.map(
          (commit) => commit.html_url,
        ),
      },
    ],
  });

  const onClick = (
    event: React.MouseEvent<HTMLCanvasElement>,
  ) => {
    if (!chartRef.current) {
      return;
    }

    const elements = getElementAtEvent(
      chartRef.current,
      event,
    );

    if (elements.length === 0) {
      return;
    }

    // Cada dataset de la gráfica Bubble representa un commit.
    const selectedIndex = elements[0].datasetIndex;
    const commit = chronologicalCommits[selectedIndex];

    if (!commit) {
      return;
    }

    const sha = commit.sha.trim().toLowerCase();

    setSelectedCommit(commit);
    setCommitTimelineData(testsByCommit.get(sha) ?? []);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCommit(null);
    setCommitTimelineData([]);
  };

  const metricCards: Array<{
    metric: Metric;
    label: string;
    axis: string;
    getValue: (commit: CommitDataObject) => number;
  }> = [
    {
      metric: "Total Número de Tests",
      label: "Total Número de Tests",
      axis: "Número de Tests",
      getValue: (commit) => commit.test_count ?? 0,
    },
    {
      metric: "Cobertura de Código",
      label: "Porcentaje de Cobertura de Código",
      axis: "Cobertura de Código",
      getValue: (commit) => commit.coverage ?? 0,
    },
    {
      metric: "Líneas de Código Modificadas",
      label: "Total de Líneas de Código Modificadas",
      axis: "Líneas de Código Modificadas",
      getValue: (commit) => commit.stats.total,
    },
  ];

  return (
    <>
      {!graph && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "85%",
              marginBottom: "20px",
              marginRight: "20px",
              position: "relative",
            }}
          >
            <h2>
              Métricas de Commits con Cobertura de Código
            </h2>

            {commits.length === 0 ? (
              <p role="status">
                No hay commits disponibles para mostrar estas
                métricas.
              </p>
            ) : (
              <>
                <div
                  style={{
                    position: "absolute",
                    right: -230,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: `${barraHeight}px`,
                      transform:
                        "translateX(-655%) translateY(6%)",
                      background:
                        "linear-gradient(to bottom, rgba(0,150,0,1), rgba(0,255,0,0))",
                      textAlign: "center",
                      display: "flex",
                    }}
                  >
                    <p
                      style={{
                        transform:
                          "translateX(-33%) translateY(-18%)",
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
                        "translateX(-599%) translateY(3%)",
                      justifyContent: "space-between",
                      height: `${barraHeight * 0.93}px`,
                      fontSize: "12px",
                      color: "#000",
                    }}
                  >
                    {coverageLabels.map((label) => (
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
                    datasets: chronologicalCommits.map(
                      (commit, index) => ({
                        label: `Commit ${index + 1}`,
                        data: [
                          {
                            x: index + 1,
                            y: commit.test_count ?? 0,
                            r: Math.max(
                              10,
                              commit.stats.total / 1.5,
                            ),
                          },
                        ],
                        backgroundColor:
                          getCommitColor(commit),
                        borderColor: "rgba(0,0,0,0.2)",
                      }),
                    ),
                  }}
                  options={{
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Commits",
                        },
                        ticks: {
                          stepSize: 1,
                          callback: (value) => {
                            const number = Number(value);

                            if (
                              Number.isInteger(number) &&
                              number >= 1 &&
                              number <=
                                chronologicalCommits.length
                            ) {
                              return `Commit ${number}`;
                            }

                            return "";
                          },
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Total número de tests",
                        },
                        min: 0,
                        max: maxTest + 6,
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: (tooltipItem) => {
                            const index =
                              tooltipItem.datasetIndex;

                            const commit =
                              chronologicalCommits[index];

                            if (!commit) {
                              return [];
                            }

                            const coverage =
                              commit.coverage == null
                                ? "Sin datos"
                                : `${commit.coverage}%`;

                            return [
                              `Commit ${index + 1}: ${commit.commit.message}`,
                              `Líneas Añadidas: ${commit.stats.additions}`,
                              `Líneas Eliminadas: ${commit.stats.deletions}`,
                              `Cobertura: ${coverage}`,
                              `Total de Tests: ${commit.test_count ?? 0}`,
                            ];
                          },
                        },
                      },
                    },
                  }}
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
                  {metricCards.map((card) => (
                    <div
                      key={card.metric}
                      style={{ width: "30%" }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver ${card.metric}`}
                      onClick={() =>
                        changeGraph(card.metric)
                      }
                      onKeyDown={(event) =>
                        handleMetricKeyDown(
                          event,
                          card.metric,
                        )
                      }
                    >
                      <h3>{card.metric}</h3>

                      <Line
                        data={getLineChartData(
                          card.label,
                          card.getValue,
                        )}
                        options={getChartOptions(card.axis)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <CommitTimelineDialog
        open={openModal}
        handleCloseModal={handleCloseModal}
        selectedCommit={selectedCommit}
        commitTimelineData={commitTimelineData}
        commits={commits}
      />

      {graph && (
        <TDDLineCharts
          port={port}
          role={role}
          filteredCommitsObject={commits}
          tddLogs={tddLogs}
          optionSelected={graph}
          commitsCycles={null}
        />
      )}

      <TDDCycleChart data={tddLogs} />
    </>
  );
};

export default TDDBoard;