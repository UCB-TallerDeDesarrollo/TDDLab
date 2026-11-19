import React, { useRef, useState, useMemo  } from "react";
import { Bubble, getElementAtEvent, Line } from "react-chartjs-2";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import TDDLineCharts from "./TDDLineChart";

import CommitTimelineDialog from "./TDDCommitTimelineDialog";
import { GitGraphCommit, TDDLogEntry, TestExecutionLog } from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import TDDCycleChart from "./TDDCycleChart";
import { getCommitBranches } from "./TDDCommitLanes";
import "../styles/TDDCommitHistory.css";

interface CycleReportViewProps {
  commits: CommitDataObject[];
  commitNumbers: ReadonlyMap<string, number>;
  gitGraph?: GitGraphCommit[];
  tddLogs: TDDLogEntry[];
  port: CommitHistoryRepository;
  role: string;
}

function indexTestsByCommit(logs: TDDLogEntry[]) {
  const cycles = new Map<number, { commits: string[]; tests: TestExecutionLog[] }>();
  for (const log of logs) {
    if (!Number.isSafeInteger(log.testId)) continue;
    const cycle = cycles.get(log.testId) ?? { commits: [], tests: [] };
    if ("commitId" in log) cycle.commits.push(log.commitId);
    else cycle.tests.push(log);
    cycles.set(log.testId, cycle);
  }

  const byCommit = new Map<string, TestExecutionLog[]>();
  for (const { commits, tests } of cycles.values()) {
    const [sha] = commits;
    if (commits.length !== 1 || !sha || sha === "HEAD") continue;
    byCommit.set(sha, [...(byCommit.get(sha) ?? []), ...tests]);
  }
  return byCommit;
}

const TDDBoard: React.FC<CycleReportViewProps> = ({
  commits,
  commitNumbers,
  gitGraph,
  tddLogs,
  role,
  port,
}) => {
  const testsByCommit = useMemo(() => indexTestsByCommit(tddLogs), [tddLogs]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const branches = useMemo(
    () => [...new Set(gitGraph?.flatMap(getCommitBranches))].sort((a, b) => a.localeCompare(b)),
    [gitGraph]
  );
  const branch = branches.includes(selectedBranch) ? selectedBranch : '';
  const commitBranchMap = useMemo(
    () => new Map(gitGraph?.map((c) => [c.sha, getCommitBranches(c)])),
    [gitGraph]
  );
  const [openModal, setOpenModal] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<CommitDataObject | null>(null);
  const [commitTimelineData, setCommitTimelineData] = useState<TestExecutionLog[]>([]);
  const chartRefCoverage = useRef<any>();
  const chartRefModifiedLines = useRef<any>();
  const chartRefTestCount = useRef<any>();
  const [graph, setGraph] = useState<string>("");
  const chronologicalCommits = commits.slice().reverse();
  const testCounts = commits.map((commit) => commit.test_count);
  const maxTest = Math.max(0, ...testCounts);
  const labels = [100, 75, 50, 25];

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
        tooltip: {
          callbacks: {
            afterBody: (context: any) => {
              const commit = chronologicalCommits[context[0]?.dataIndex];
              if (!commit) return [];
              const commitBranches = commitBranchMap.get(commit.sha);
              return commitBranches?.length ? [`Rama: ${commitBranches.join(", ")}`] : [];
            },
          },
        },
      },
    };
  };

  const getLineChartData = (label: string, data: number[]) => {
    return {
      labels: chronologicalCommits.map(({ sha }) => `Commit ${commitNumbers.get(sha)}`),
      datasets: [
        {
          label,
          data: [...data].reverse(),
          backgroundColor: chronologicalCommits
            .map((commit) => {
              const commitBranches = commitBranchMap.get(commit.sha) ?? [];
              const isBranchActive = branch ? commitBranches.includes(branch) : true;
              return isBranchActive ? getCommitColor(commit) : "rgba(200, 200, 200, 0.2)";
            }),
          borderColor: "rgba(0, 0, 0, 0.2)",
          pointBorderColor: chronologicalCommits
            .map((commit) => {
              const commitBranches = commitBranchMap.get(commit.sha) ?? [];
              return branch && commitBranches.includes(branch) ? "#378de5" : "rgba(0, 0, 0, 0.2)";
            }),
          pointBorderWidth: chronologicalCommits
            .map((commit) => {
              const commitBranches = commitBranchMap.get(commit.sha) ?? [];
              return branch && commitBranches.includes(branch) ? 3 : 1;
            }),
          pointRadius: chronologicalCommits
            .map((commit) => {
              const commitBranches = commitBranchMap.get(commit.sha) ?? [];
              return branch && commitBranches.includes(branch) ? 10 : 8;
            }),
          links: commits.map((commit) => commit.html_url).reverse(),
        },
      ],
    };
  };
  const chartRef = useRef<any>();  

  const onClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current) return;
    const [point] = getElementAtEvent(chartRef.current, event);
    if (!point) return;
    const commit = chronologicalCommits[point.datasetIndex];
    if (!commit) return;

    setCommitTimelineData(testsByCommit.get(commit.sha) ?? []);
    setSelectedCommit(commit);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCommit(null);
  };
  
  return (
    <>
      {!graph ? (
        <section className="tdd-dashboard">
          <div className="tdd-dashboard-header">
            <h2>Métricas de Commits con Cobertura de Código</h2>
            {branches.length > 1 && (
              <label className="commit-branch-filter">
                Resaltar rama
                <select value={branch} onChange={(event) => setSelectedBranch(event.target.value)}>
                  <option value="">Todas</option>
                  {branches.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </label>
            )}
          </div>
          <div className="tdd-dashboard-overview">
            <div className="tdd-dashboard-chart">
              <Bubble
                ref={chartRef}
                onClick={onClick}
                data={{
                  datasets: chronologicalCommits.map((commit, index) => {
                      const number = commitNumbers.get(commit.sha) ?? index + 1;
                      const commitBranches = commitBranchMap.get(commit.sha) ?? [];
                      const isBranchActive = branch ? commitBranches.includes(branch) : true;
                      const baseColor = getCommitColor(commit);

                      return {
                        label: `Commit ${number}`,
                        data: [
                          {
                            x: number,
                            y: commit.test_count,
                            r: Math.max(10, commit.stats.total / 1.5),
                          },
                        ],
                        backgroundColor: isBranchActive ? baseColor : "rgba(200, 200, 200, 0.2)",
                        borderColor: branch && commitBranches.includes(branch)
                          ? "#378de5"
                          : `rgba(0,0,0,0.2)`,
                        borderWidth: branch && commitBranches.includes(branch) ? 3 : 1,
                      };
                    }),
                }}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: { display: true, text: "Commits" },
                      ticks: {
                        callback: (value) => Number.isInteger(Number(value)) ? `Commit ${value}` : undefined,
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
                          const commit = chronologicalCommits[tooltipItem.datasetIndex];
                          const commitNumber = commitNumbers.get(commit.sha);
                          const commitBranches = commitBranchMap.get(commit.sha);
                          const branchLine = commitBranches?.length
                            ? [`Rama: ${commitBranches.join(", ")}`]
                            : [];
                          return [
                            `Commit ${commitNumber}: ${commit.commit.message}`,
                            ...branchLine,
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
            </div>
            <div className="tdd-dashboard-coverage">
              <strong>Cobertura</strong>
              <div className="tdd-dashboard-scale">
                <div className="tdd-dashboard-gradient" aria-hidden="true" />
                <div className="tdd-dashboard-ticks">
                  {labels.map((label) => <span key={label}>{label}</span>)}
                </div>
              </div>
            </div>
          </div>
          <CommitTimelineDialog
            open={openModal}
            handleCloseModal={handleCloseModal}
            selectedCommit={selectedCommit}
            commitTimelineData={commitTimelineData}
            commitNumber={selectedCommit ? commitNumbers.get(selectedCommit.sha) : undefined}
            branch={selectedCommit ? commitBranchMap.get(selectedCommit.sha)?.join(", ") : undefined}
          />
          <div className="tdd-dashboard-metrics">
            <div
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
        </section>
      ) : null}

      {graph && (
        <>
          <TDDLineCharts
            port={port}
            role={role}
            filteredCommitsObject={commits}
            tddLogs={tddLogs}
            optionSelected={graph}
            gitGraph={gitGraph}
            commitsCycles={null}
          />
        </>

      )}
      <TDDCycleChart data={tddLogs} />
    </>    
  );
};

export default TDDBoard;
