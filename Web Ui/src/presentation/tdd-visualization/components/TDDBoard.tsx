import { formatDate } from "../../../modules/TDDCycles-Visualization/application/GetTDDCycles";
import { indexTestsByCommit, testResult } from "../../../modules/TDDCycles-Visualization/application/commitExecutions";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bubble, getElementAtEvent, Line } from "react-chartjs-2";
import type {
  Chart,
  ChartData,
  ChartOptions,
  Plugin,
  ScriptableLineSegmentContext,
  TooltipItem,
} from "chart.js";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import TDDLineCharts from "./TDDLineChart";
import CommitTimelineDialog from "./TDDCommitTimelineDialog";
import {
  GitGraphCommit,
  TDDLogEntry,
  TestExecutionLog,
} from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import TDDCycleChart from "./TDDCycleChart";
import BranchFocusBar from "./BranchFocusBar";
import TDDBranchRail from "./TDDBranchRail";
import {
  type BranchMetadata,
  type BranchSelection,
  buildBranchMetadata,
  buildMeasuredTrajectoryEdges,
  DIMMED_BORDER_COLOR,
  DIMMED_FILL_COLOR,
  formatCoverageLabel,
  getCommitBranchAccentColor,
  getCommitColor,
  getSharedActiveBranch,
  isCommitInActiveBranches,
  resolveActiveBranches,
  toggleBranchSelection,
} from "./branchVisualization";
import "../styles/TDDCommitHistory.css";

interface CycleReportViewProps {
  commits: CommitDataObject[];
  commitNumbers: ReadonlyMap<string, number>;
  gitGraph?: GitGraphCommit[];
  tddLogs: TDDLogEntry[];
  port: CommitHistoryRepository;
  role: string;
  branchMeta?: BranchMetadata;
  selectedBranches?: ReadonlySet<string> | null;
  activeBranches?: ReadonlySet<string> | null;
  previewBranch?: string | "all" | null;
  onToggleBranch?: (branch: string) => void;
  onSelectAllBranches?: () => void;
  onPreviewBranch?: (branch: string | "all" | null) => void;
  onSelectMetric?: (metric: string) => void;
  logsError?: boolean;
}

const TDDBoard: React.FC<CycleReportViewProps> = ({
  commits,
  commitNumbers,
  gitGraph,
  tddLogs,
  role,
  port,
  branchMeta: externalBranchMeta,
  selectedBranches: externalSelectedBranches,
  activeBranches: externalActiveBranches,
  previewBranch: externalPreviewBranch,
  onToggleBranch: externalToggleBranch,
  onSelectAllBranches: externalSelectAllBranches,
  onPreviewBranch: externalOnPreviewBranch,
  onSelectMetric,
  logsError = false,
}) => {
  const testsByCommit = useMemo(() => indexTestsByCommit(tddLogs), [tddLogs]);
  const measuredShas = useMemo(() => new Set(commits.map((commit) => commit.sha)), [commits]);
  const fallbackBranchMeta = useMemo(
    () => buildBranchMetadata(gitGraph, measuredShas),
    [gitGraph, measuredShas],
  );
  const branchMeta = externalBranchMeta ?? fallbackBranchMeta;

  const [localSelection, setLocalSelection] = useState<BranchSelection>("auto");
  const [localPreview, setLocalPreview] = useState<string | "all" | null>(null);
  useEffect(() => {
    setLocalSelection("auto");
    setLocalPreview(null);
  }, [branchMeta.branchesKey]);

  const selectedBranches =
    externalSelectedBranches !== undefined
      ? externalSelectedBranches
      : resolveActiveBranches(localSelection, branchMeta);

  const previewBranch =
    externalPreviewBranch !== undefined ? externalPreviewBranch : localPreview;

  const activeBranches = useMemo<ReadonlySet<string> | null>(() => {
    if (externalActiveBranches !== undefined) return externalActiveBranches;
    if (previewBranch === "all") return null;
    if (previewBranch && branchMeta.branchColorMap.has(previewBranch)) {
      return new Set([previewBranch]);
    }
    return selectedBranches;
  }, [externalActiveBranches, previewBranch, branchMeta, selectedBranches]);

  const handleToggleBranch =
    externalToggleBranch ??
    ((branch: string) =>
      setLocalSelection((prev) => toggleBranchSelection(prev, branch, branchMeta)));

  const handleSelectAllBranches =
    externalSelectAllBranches ?? (() => setLocalSelection("all"));

  const handlePreviewBranch = externalOnPreviewBranch ?? setLocalPreview;

  const [openModal, setOpenModal] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<CommitDataObject | null>(null);
  const [commitTimelineData, setCommitTimelineData] = useState<TestExecutionLog[]>([]);
  const chartRefCoverage = useRef<Chart<"line", Array<number | null>>>();
  const chartRefModifiedLines = useRef<Chart<"line", Array<number | null>>>();
  const chartRefTestCount = useRef<Chart<"line", Array<number | null>>>();
  const [graph, setGraph] = useState<string>("");
  const chronologicalCommits = useMemo(() => [...new Map(commits.map(commit => [commit.sha, commit])).values()].sort((a, b) => new Date(a.commit.date).getTime() - new Date(b.commit.date).getTime() || a.sha.localeCompare(b.sha)), [commits]);
  const testCounts = chronologicalCommits.map((commit) => commit.test_count);
  const maxTest = Math.max(0, ...testCounts);
  const yAxisMax = Math.max(4, maxTest + Math.max(2, Math.ceil(maxTest * 0.3)));
  const commitXNumbers = useMemo(
    () => chronologicalCommits.map((commit, index) => commitNumbers.get(commit.sha) ?? index + 1),
    [chronologicalCommits, commitNumbers],
  );
  const minCommitX = commitXNumbers.length > 0 ? Math.min(...commitXNumbers) : 1;
  const maxCommitX = commitXNumbers.length > 0 ? Math.max(...commitXNumbers) : 1;
  const xAxisPadding = commitXNumbers.length <= 2 ? 0.8 : 0.65;
  const trajectoryEdges = useMemo(
    () => buildMeasuredTrajectoryEdges(gitGraph, measuredShas, branchMeta),
    [gitGraph, measuredShas, branchMeta],
  );
  const datasetIndexBySha = useMemo(
    () => new Map(chronologicalCommits.map((commit, index) => [commit.sha, index])),
    [chronologicalCommits],
  );
  const trajectoryRef = useRef({
    trajectoryEdges,
    datasetIndexBySha,
    branchMeta,
    activeBranches,
  });
  trajectoryRef.current = {
    trajectoryEdges,
    datasetIndexBySha,
    branchMeta,
    activeBranches,
  };
  const branchTrajectoryPlugin = useMemo<Plugin<"bubble">>(
    () => ({
      id: "tddBranchTrajectory",
      beforeDatasetsDraw(chart) {
        const {
          trajectoryEdges: edges,
          datasetIndexBySha: indexBySha,
          branchMeta: meta,
          activeBranches: active,
        } = trajectoryRef.current;
        if (edges.length === 0) return;
        const { ctx } = chart;
        ctx.save();
        for (const edge of edges) {
          const fromIdx = indexBySha.get(edge.fromSha);
          const toIdx = indexBySha.get(edge.toSha);
          if (fromIdx === undefined || toIdx === undefined) continue;

          const fromPoint = chart.getDatasetMeta(fromIdx)?.data?.[0];
          const toPoint = chart.getDatasetMeta(toIdx)?.data?.[0];
          if (!fromPoint || !toPoint) continue;

          const fromActive = isCommitInActiveBranches(edge.fromSha, meta, active);
          const toActive = isCommitInActiveBranches(edge.toSha, meta, active);
          const bothActive = fromActive && toActive;
          const touchesActive = fromActive || toActive;
          const color =
            (edge.branch ? meta.branchColorMap.get(edge.branch) : undefined) ?? "#64748b";

          ctx.beginPath();
          const midX = (fromPoint.x + toPoint.x) / 2;
          ctx.moveTo(fromPoint.x, fromPoint.y);
          ctx.bezierCurveTo(midX, fromPoint.y, midX, toPoint.y, toPoint.x, toPoint.y);
          ctx.strokeStyle = bothActive || touchesActive ? color : "#cbd5e1";
          ctx.lineWidth = bothActive ? (edge.sameBranch ? 2.2 : 1.6) : 1.25;
          ctx.globalAlpha = bothActive ? (edge.sameBranch ? 0.55 : 0.35) : touchesActive ? 0.24 : 0.2;
          ctx.setLineDash(edge.sameBranch && bothActive ? [] : [5, 4]);
          ctx.stroke();
        }
        ctx.restore();
      },
    }),
    [],
  );
  const labels = [100, 75, 50, 25];

  const changeGraph = (graphText: string) => {
    if (onSelectMetric) {
      onSelectMetric(graphText);
      return;
    }
    setGraph(graphText);
    localStorage.setItem("selectedMetric", graphText);
  };

  const openCommitModal = (commit: CommitDataObject) => {
    setCommitTimelineData(testsByCommit.get(commit.sha) ?? []);
    setSelectedCommit(commit);
    setOpenModal(true);
  };

  const getChartOptions = (
    yAxisText: string,
    includeCoverageDetail = false,
  ): ChartOptions<"line"> => {
    return {
      responsive: true,
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
            padding: { top: 20 },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          callbacks: {
            afterBody: (context: TooltipItem<"line">[]) => {
              const commit = chronologicalCommits[context[0]?.dataIndex];
              if (!commit) return [];
              const lines: string[] = [];
              const commitBranches = branchMeta.commitBranchMap.get(commit.sha);
              if (commitBranches?.length) {
                lines.push(`Rama: ${commitBranches.join(", ")}`);
              }
              if (includeCoverageDetail) {
                lines.push(`Cobertura: ${formatCoverageLabel(commit.coverage)}`);
              }
              return lines;
            },
          },
        },
      },
    };
  };

  const getLineChartData = (
    label: string,
    data: Array<number | null>,
  ): ChartData<"line", Array<number | null>> => {
    return {
      labels: chronologicalCommits.map(
        ({ sha }, index) => `Commit ${commitNumbers.get(sha) ?? index + 1}`,
      ),
      datasets: [
        {
          label,
          data,
          spanGaps: false,
          backgroundColor: "rgba(0, 110, 0, 0.85)",
          pointBackgroundColor: chronologicalCommits.map((commit) => {
            const isBranchActive = isCommitInActiveBranches(
              commit.sha,
              branchMeta,
              activeBranches,
            );
            return isBranchActive ? getCommitColor(commit) : DIMMED_FILL_COLOR;
          }),
          borderColor: "rgba(0, 0, 0, 0.2)",
          pointBorderColor: chronologicalCommits.map((commit) => {
            const isBranchActive = isCommitInActiveBranches(
              commit.sha,
              branchMeta,
              activeBranches,
            );
            if (!isBranchActive) return DIMMED_BORDER_COLOR;
            const accent = getCommitBranchAccentColor(commit.sha, branchMeta, activeBranches);
            if (activeBranches !== null && accent) return accent;
            if (branchMeta.branches.length > 1 && accent) return accent;
            return "rgba(0, 0, 0, 0.2)";
          }),
          pointBorderWidth: chronologicalCommits.map((commit) => {
            const isBranchActive = isCommitInActiveBranches(
              commit.sha,
              branchMeta,
              activeBranches,
            );
            if (!isBranchActive) return 1;
            const accent = getCommitBranchAccentColor(commit.sha, branchMeta, activeBranches);
            if (activeBranches !== null && accent) return 3;
            if (branchMeta.branches.length > 1 && accent) return 2;
            return 1;
          }),
          pointRadius: chronologicalCommits.map((commit) => {
            const isBranchActive = isCommitInActiveBranches(
              commit.sha,
              branchMeta,
              activeBranches,
            );
            if (!isBranchActive) return 6;
            return activeBranches !== null ? 9 : 7;
          }),
          pointHoverRadius: 12,
          segment: {
            borderColor: (ctx: ScriptableLineSegmentContext) => {
              const from = chronologicalCommits[ctx.p0DataIndex];
              const to = chronologicalCommits[ctx.p1DataIndex];
              if (!from || !to) return "rgba(0, 0, 0, 0.2)";
              const fromActive = isCommitInActiveBranches(from.sha, branchMeta, activeBranches);
              const toActive = isCommitInActiveBranches(to.sha, branchMeta, activeBranches);
              if (!fromActive || !toActive) return "rgba(180, 180, 180, 0.2)";
              if (branchMeta.branches.length > 1) {
                const shared = getSharedActiveBranch(
                  from.sha,
                  to.sha,
                  branchMeta,
                  activeBranches,
                );
                if (shared) return branchMeta.branchColorMap.get(shared) ?? "rgba(5, 40, 69, 0.45)";
                return "rgba(130, 145, 160, 0.35)";
              }
              return "rgba(0, 0, 0, 0.2)";
            },
            borderDash: (ctx: ScriptableLineSegmentContext) => {
              const from = chronologicalCommits[ctx.p0DataIndex];
              const to = chronologicalCommits[ctx.p1DataIndex];
              if (!from || !to) return undefined;
              const fromActive = isCommitInActiveBranches(from.sha, branchMeta, activeBranches);
              const toActive = isCommitInActiveBranches(to.sha, branchMeta, activeBranches);
              if (!fromActive || !toActive) return [4, 4];
              if (
                branchMeta.branches.length > 1 &&
                !getSharedActiveBranch(from.sha, to.sha, branchMeta, activeBranches)
              ) {
                return [4, 4];
              }
              return undefined;
            },
          },
        },
      ],
    };
  };

  const chartRef = useRef<Chart<"bubble">>();

  const onClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current) return;
    const [point] = getElementAtEvent(chartRef.current, event);
    if (!point) return;
    const commit = chronologicalCommits[point.datasetIndex];
    if (!commit) return;

    openCommitModal(commit);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCommit(null);
  };

  const handleMetricKeyDown = (metricName: string) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      changeGraph(metricName);
    }
  };

  const selectedCommitBranches = selectedCommit
    ? branchMeta.commitBranchMap.get(selectedCommit.sha)
    : undefined;
  const hasUnknownCoverage = useMemo(
    () => commits.some((commit) => commit.coverage === null || commit.coverage === undefined),
    [commits],
  );
  const hasGitGraph = Boolean(gitGraph?.length);
  const hasLinkedExecutions = testsByCommit.size > 0;

  return (
    <>
      {!graph ? (
        <section className="tdd-dashboard">
          {hasGitGraph ? (
            <>
              <div className="tdd-dashboard-header">
                <h2>Historial Git — ramas y commits</h2>
              </div>
              <BranchFocusBar
                meta={branchMeta}
                selectedBranches={selectedBranches}
                previewBranch={previewBranch}
                onToggleBranch={handleToggleBranch}
                onSelectAll={handleSelectAllBranches}
                onPreviewBranch={handlePreviewBranch}
                onViewHistory={onSelectMetric ? () => changeGraph("Lista") : undefined}
              />
              <TDDBranchRail
                tddLogs={tddLogs}
                gitGraph={gitGraph}
                commits={commits}
                commitNumbers={commitNumbers}
                branchMeta={branchMeta}
                activeBranches={activeBranches}
                onSelectCommit={openCommitModal}
                onToggleBranch={handleToggleBranch}
                onPreviewBranch={handlePreviewBranch}
              />
              <h3>Resumen de métricas</h3>
            </>
          ) : (
            <div className="tdd-dashboard-header tdd-dashboard-header--legacy">
              <h2>Resumen de métricas</h2>
              <span
                className="tdd-legacy-notice"
                title="Los registros de este repositorio no incluyen SHA y padres para reconstruir las ramas."
              >
                Formato clásico · Sin registro de ramas
              </span>
            </div>
          )}
          <div className="tdd-dashboard-metrics">
            <div
              className="tdd-dashboard-metric-card"
              onClick={() => changeGraph("Total Número de Tests")}
              tabIndex={0}
              onKeyDown={handleMetricKeyDown("Total Número de Tests")}
              role="button"
              aria-label="Abrir gráfica de Total Número de Tests"
            >
              <h3>Total Número de Tests</h3>
              <Line
                data={getLineChartData(
                  "Total Número de Tests",
                  chronologicalCommits.map((commit) => commit.test_count),
                )}
                options={getChartOptions("Número de Tests")}
                ref={chartRefTestCount}
              />
            </div>
            <div
              className="tdd-dashboard-metric-card"
              onClick={() => changeGraph("Cobertura de Código")}
              tabIndex={0}
              onKeyDown={handleMetricKeyDown("Cobertura de Código")}
              role="button"
              aria-label="Abrir gráfica de Cobertura de Código"
            >
              <h3>Cobertura de Código</h3>
              <Line
                data={getLineChartData(
                  "Porcentaje de Cobertura de Código",
                  chronologicalCommits.map((commit) => commit.coverage ?? null),
                )}
                options={getChartOptions("Cobertura de Código", true)}
                ref={chartRefCoverage}
              />
            </div>
            <div
              className="tdd-dashboard-metric-card"
              onClick={() => changeGraph("Líneas de Código Modificadas")}
              tabIndex={0}
              onKeyDown={handleMetricKeyDown("Líneas de Código Modificadas")}
              role="button"
              aria-label="Abrir gráfica de Líneas de Código Modificadas"
            >
              <h3>Líneas de Código Modificadas</h3>
              <Line
                data={getLineChartData(
                  "Total de Líneas de Código Modificadas",
                  chronologicalCommits.map((commit) => commit.stats.total),
                )}
                options={getChartOptions("Líneas de Código Modificadas")}
                ref={chartRefModifiedLines}
              />
            </div>
          </div>
          <h3>Métricas de commits — gráfica de burbujas</h3>
          <div className="tdd-dashboard-overview">
            <div className="tdd-dashboard-chart">
              <Bubble
                ref={chartRef}
                onClick={onClick}
                plugins={[branchTrajectoryPlugin]}
                data={{
                  datasets: chronologicalCommits.map((commit, index) => {
                    const number = commitNumbers.get(commit.sha) ?? index + 1;
                    const isBranchActive = isCommitInActiveBranches(
                      commit.sha,
                      branchMeta,
                      activeBranches,
                    );
                    const accentColor = getCommitBranchAccentColor(
                      commit.sha,
                      branchMeta,
                      activeBranches,
                    );
                    const baseColor = getCommitColor(commit);
                    const hasFocusedRing = activeBranches !== null && isBranchActive && Boolean(accentColor);
                    const hasAllBranchRing =
                      activeBranches === null &&
                      branchMeta.branches.length > 1 &&
                      Boolean(accentColor);

                    let borderColor = "rgba(0,0,0,0.2)";
                    let borderWidth = 1;
                    if (!isBranchActive) {
                      borderColor = DIMMED_BORDER_COLOR;
                      borderWidth = 1.5;
                    } else if (hasFocusedRing && accentColor) {
                      borderColor = accentColor;
                      borderWidth = 3;
                    } else if (hasAllBranchRing && accentColor) {
                      borderColor = accentColor;
                      borderWidth = 2.5;
                    }

                    const baseRadius = Math.min(28, Math.max(10, commit.stats.total / 1.5));

                    return {
                      label: `Commit ${number}`,
                      data: [
                        {
                          x: number,
                          y: commit.test_count,
                          r: isBranchActive ? baseRadius : Math.max(8, baseRadius * 0.85),
                        },
                      ],
                      hoverRadius: 4,
                      backgroundColor: isBranchActive ? baseColor : DIMMED_FILL_COLOR,
                      borderColor,
                      borderWidth,
                    };
                  }),
                }}
                options={{
                  maintainAspectRatio: false,
                  animation: { duration: 140 },
                  layout: {
                    padding: { top: 8, right: 12, bottom: 4, left: 4 },
                  },
                  scales: {
                    x: {
                      min: minCommitX - xAxisPadding,
                      max: maxCommitX + xAxisPadding,
                      title: { display: true, text: "Commits" },
                      ticks: {
                        callback: (value) => {
                          const numeric = Number(value);
                          return Number.isInteger(numeric) &&
                            numeric >= minCommitX &&
                            numeric <= maxCommitX
                            ? `Commit ${numeric}`
                            : "";
                        },
                        stepSize: 1,
                      },
                    },
                    y: {
                      title: { display: true, text: "Total número de tests" },
                      min: 0,
                      max: yAxisMax,
                      ticks: {
                        precision: 0,
                      },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (tooltipItem: TooltipItem<"bubble">) => {
                          const commit = chronologicalCommits[tooltipItem.datasetIndex];
                          if (!commit) return [];
                          const commitNumber =
                            commitNumbers.get(commit.sha) ?? tooltipItem.datasetIndex + 1;
                          const commitBranches = branchMeta.commitBranchMap.get(commit.sha);
                          const branchLine = commitBranches?.length
                            ? [`Rama: ${commitBranches.join(", ")}`]
                            : [];
                          const topologyTags: string[] = [];
                          if (branchMeta.forks.has(commit.sha)) topologyTags.push("Bifurcación");
                          if (branchMeta.merges.has(commit.sha)) topologyTags.push("Merge");
                          const topologyLine = topologyTags.length
                            ? [`Topología: ${topologyTags.join(" · ")}`]
                            : [];
                          return [
                            `Commit ${commitNumber}: ${commit.commit.message}`,
                            ...branchLine,
                            ...topologyLine,
                            `Líneas Modificadas: ${commit.stats.additions}`,
                            `Líneas Eliminadas: ${commit.stats.deletions}`,
                            `Cobertura: ${formatCoverageLabel(commit.coverage)}`,
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
                  {labels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="tdd-bubble-legend" aria-label="Leyenda de colores de commits">
            <span className="tdd-bubble-legend-item">
              <span className="tdd-bubble-dot tdd-bubble-dot--green" aria-hidden="true" />
              Exitoso
            </span>
            <span className="tdd-bubble-legend-item">
              <span className="tdd-bubble-dot tdd-bubble-dot--fail" aria-hidden="true" />
              Fallido
            </span>
            {hasUnknownCoverage && (
              <span className="tdd-bubble-legend-item">
                <span className="tdd-bubble-dot tdd-bubble-dot--unknown" aria-hidden="true" />
                Sin datos de cobertura
              </span>
            )}
            {branchMeta.branches.length > 1 && (
              <span className="tdd-bubble-legend-item">
                <span className="tdd-bubble-dot tdd-bubble-dot--ring" aria-hidden="true" />
                Borde = rama
              </span>
            )}
          </div>

      <section aria-label="Línea de tiempo de commits">
          <div className="tdd-timeline-header">
            <h3>Línea de tiempo de commits</h3>
            {!hasLinkedExecutions && chronologicalCommits.length > 0 && (
              <span className="tdd-timeline-note">
                {logsError
                  ? "Ejecuciones individuales no disponibles"
                  : "Sin ejecuciones individuales vinculadas"}
              </span>
            )}
          </div>
          {!chronologicalCommits.length && <p>No hay commits con métricas registradas.</p>}
          <ol className="tdd-dashboard-timeline">
            {chronologicalCommits.map((commit, index) => {
              const number = commitNumbers.get(commit.sha) ?? index + 1;
              const results = (testsByCommit.get(commit.sha) ?? []).map(testResult);
              const successes = results.filter(result => result === "success").length;
              const failures = results.filter(result => result === "failure").length;
              const unknown = results.length - successes - failures;
              const counts = [
                successes && successes + " exitosa(s)",
                failures && failures + " fallida(s)",
                unknown && unknown + " sin resultado",
              ].filter(Boolean).join(" · ");
              const cardResult = failures
                ? "failure"
                : successes
                  ? "success"
                  : !hasLinkedExecutions && commit.conclusion === "failure"
                    ? "failure"
                    : !hasLinkedExecutions && commit.conclusion === "success"
                      ? "success"
                      : "unknown";
              const isHeadPlaceholder = commit.sha === "HEAD";
              return (
                <li key={commit.sha}>
                  <button
                    type="button"
                    aria-pressed={selectedCommit?.sha === commit.sha}
                    onClick={() => openCommitModal(commit)}
                    data-result={cardResult}
                    title={commit.commit.message}
                  >
                    <div className="tdd-timeline-card-meta">
                      <span className="tdd-timeline-card-number">Commit {number}</span>
                      <code title={commit.sha}>
                        {isHeadPlaceholder ? "Último commit" : commit.sha.slice(0, 7)}
                      </code>
                    </div>
                    <span>{commit.commit.message.split(/\r?\n/)[0]}</span>
                    <small>{formatDate(new Date(commit.commit.date))}</small>
                    <small>Tests: {commit.test_count ?? "Sin datos"} · Cobertura: {commit.coverage == null ? "Sin datos" : commit.coverage + "%"} · Líneas: {commit.stats.total ?? "Sin datos"}</small>
                    {hasLinkedExecutions && (
                      <small>{counts || (logsError ? "Ejecuciones no disponibles" : "Sin ejecución vinculada")}</small>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          {hasGitGraph && (
            <button type="button" className="tdd-branch-history-link" onClick={() => changeGraph("Lista")}>Ver historial de ramas</button>
          )}
        </section>
            <CommitTimelineDialog
            open={openModal}
            handleCloseModal={handleCloseModal}
            selectedCommit={selectedCommit}
            commitTimelineData={commitTimelineData}
            commitNumber={selectedCommit ? commitNumbers.get(selectedCommit.sha) : undefined}
            branch={selectedCommitBranches?.join(", ")}
            branches={selectedCommitBranches}
            branchColorMap={branchMeta.branchColorMap}
          />

        </section>
      ) : null}

      {graph && (
        <TDDLineCharts
          port={port}
          role={role}
          filteredCommitsObject={commits}
          tddLogs={tddLogs}
          optionSelected={graph}
          gitGraph={gitGraph}
          commitsCycles={null}
          branchMeta={branchMeta}
          selectedBranches={selectedBranches}
          activeBranches={activeBranches}
          previewBranch={previewBranch}
          onToggleBranch={handleToggleBranch}
          onSelectAllBranches={handleSelectAllBranches}
          onPreviewBranch={handlePreviewBranch}
          onSelectMetric={onSelectMetric}
          logsError={logsError}
        />
      )}
      <TDDCycleChart
        data={tddLogs}
        commitNumbers={commitNumbers}
        gitGraph={gitGraph}
        branchMeta={branchMeta}
        activeBranches={activeBranches}
        logsError={logsError}
      />
    </>
  );
};

export default TDDBoard;
