import React, { useEffect, useMemo, useRef, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import type { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type { GitGraphCommit } from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import { layoutCommits } from "./TDDCommitLanes";
import {
  BRANCH_PALETTE,
  type BranchMetadata,
  getCommitBranchAccentColor,
  getCommitColor,
  isCommitInActiveBranches,
} from "./branchVisualization";

interface TDDBranchRailProps {
  gitGraph?: GitGraphCommit[];
  commits: CommitDataObject[];
  commitNumbers: ReadonlyMap<string, number>;
  branchMeta: BranchMetadata;
  activeBranches: ReadonlySet<string> | null;
  onSelectCommit?: (commit: CommitDataObject) => void;
  onToggleBranch?: (branch: string) => void;
  onPreviewBranch?: (branch: string | "all" | null) => void;
}

const LEFT_GUTTER = 152;
const RIGHT_GUTTER = 34;
const MIN_STEP_X = 76;
const LANE_SPACING = 30;
const TOP_PADDING = 22;
const BOTTOM_PADDING = 34;

const TDDBranchRail: React.FC<TDDBranchRailProps> = ({
  gitGraph,
  commits,
  commitNumbers,
  branchMeta,
  activeBranches,
  onSelectCommit,
  onToggleBranch,
  onPreviewBranch,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const hasTopology =
    Boolean(gitGraph && gitGraph.length > 1) &&
    (branchMeta.branches.length > 1 ||
      branchMeta.forks.size > 0 ||
      branchMeta.merges.size > 0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !hasTopology) return;

    const updateWidth = () => setContainerWidth(el.clientWidth);
    updateWidth();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasTopology]);

  const commitBySha = useMemo(
    () => new Map(commits.map((commit) => [commit.sha, commit])),
    [commits],
  );

  const railData = useMemo(() => {
    if (!hasTopology || !gitGraph) return null;
    const layout = layoutCommits(gitGraph);
    const chronologicalRows = [...layout.rows].reverse();

    const useBranchSwimlanes = branchMeta.branches.length > 1;
    const hasUnlabeledCommit = chronologicalRows.some(
      (row) => (branchMeta.commitBranchMap.get(row.commit.sha) ?? []).length === 0,
    );
    const swimlanes = useBranchSwimlanes
      ? [...branchMeta.branches, ...(hasUnlabeledCommit ? ["Sin rama"] : [])]
      : [];

    const laneCount = useBranchSwimlanes
      ? swimlanes.length
      : chronologicalRows.reduce((max, row) => Math.max(max, row.lane), 0) + 1;

    const leftStart = useBranchSwimlanes ? LEFT_GUTTER : 36;
    const commitCount = chronologicalRows.length;
    const minPlotWidth = Math.max(220, Math.max(1, commitCount - 1) * MIN_STEP_X);
    const targetViewport = Math.max(containerWidth || 720, leftStart + minPlotWidth + RIGHT_GUTTER);
    const availablePlot = Math.max(minPlotWidth, targetViewport - leftStart - RIGHT_GUTTER);
    const stepX = commitCount > 1 ? availablePlot / (commitCount - 1) : 0;

    const positions = new Map<string, { x: number; y: number; laneIndex: number }>();
    chronologicalRows.forEach((row, index) => {
      const commitBranches = branchMeta.commitBranchMap.get(row.commit.sha) ?? [];
      const laneIndex = useBranchSwimlanes
        ? commitBranches.length > 0
          ? Math.max(0, swimlanes.indexOf(commitBranches[0]))
          : swimlanes.length - 1
        : row.lane;
      const x = commitCount === 1 ? leftStart + availablePlot / 2 : leftStart + index * stepX;
      const y = TOP_PADDING + laneIndex * LANE_SPACING;
      positions.set(row.commit.sha, { x, y, laneIndex });
    });

    const width = Math.round(leftStart + availablePlot + RIGHT_GUTTER);
    const plotBottom = TOP_PADDING + Math.max(0, laneCount - 1) * LANE_SPACING;
    const height = plotBottom + BOTTOM_PADDING;

    return {
      rows: chronologicalRows,
      forks: layout.forks,
      positions,
      swimlanes,
      useBranchSwimlanes,
      leftStart,
      width,
      height,
      labelY: plotBottom + 24,
    };
  }, [gitGraph, hasTopology, branchMeta, containerWidth]);

  if (!railData) {
    return null;
  }

  return (
    <div className="tdd-branch-rail" role="region" aria-label="Recorrido de ramas y merges">
      <div className="tdd-branch-rail-header">
        <span className="tdd-branch-rail-title">Topología de ramas</span>
        <div className="tdd-branch-rail-legend">
          <span className="tdd-branch-rail-legend-item">
            <span className="tdd-rail-swatch tdd-rail-swatch--measured" aria-hidden="true" />
            Con métricas (clic para ver detalle)
          </span>
          <span className="tdd-branch-rail-legend-item">
            <span className="tdd-rail-swatch tdd-rail-swatch--context" aria-hidden="true" />
            Solo contexto Git
          </span>
          <span className="tdd-branch-rail-legend-item">
            <span className="tdd-rail-swatch tdd-rail-swatch--merge" aria-hidden="true" />
            Merge
          </span>
        </div>
      </div>
      <div ref={scrollRef} className="tdd-branch-rail-scroll">
        <svg
          width={railData.width}
          height={railData.height}
          viewBox={`0 0 ${railData.width} ${railData.height}`}
          className="tdd-branch-rail-svg"
        >
          {/* Interactive branch lane labels on left */}
          {railData.useBranchSwimlanes &&
            railData.swimlanes.map((laneName, laneIndex) => {
              const y = TOP_PADDING + laneIndex * LANE_SPACING;
              const isRealBranch = branchMeta.branchColorMap.has(laneName);
              const color = branchMeta.branchColorMap.get(laneName) ?? "#94a3b8";
              const isLaneActive =
                activeBranches === null || (isRealBranch && activeBranches.has(laneName));
              const shortLabel =
                laneName.length > 17 ? `${laneName.slice(0, 16)}…` : laneName;

              return (
                <g key={`lane-${laneName}`}>
                  <rect
                    x={0}
                    y={y - LANE_SPACING / 2 + 2}
                    width={railData.width}
                    height={LANE_SPACING - 4}
                    rx={4}
                    fill={isLaneActive ? color : "#f8fafc"}
                    fillOpacity={isLaneActive ? 0.04 : 0}
                  />
                  <g
                    role={isRealBranch && onToggleBranch ? "button" : undefined}
                    tabIndex={isRealBranch && onToggleBranch ? 0 : undefined}
                    aria-label={
                      isRealBranch && onToggleBranch
                        ? `Alternar rama ${laneName} desde la topología`
                        : undefined
                    }
                    style={{ cursor: isRealBranch && onToggleBranch ? "pointer" : "default" }}
                    onMouseEnter={() => {
                      if (isRealBranch) onPreviewBranch?.(laneName);
                    }}
                    onMouseLeave={() => {
                      if (isRealBranch) onPreviewBranch?.(null);
                    }}
                    onClick={() => {
                      if (isRealBranch && onToggleBranch) onToggleBranch(laneName);
                    }}
                    onKeyDown={(event) => {
                      if (
                        isRealBranch &&
                        onToggleBranch &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();
                        onToggleBranch(laneName);
                      }
                    }}
                  >
                    <title>{laneName}</title>
                    <rect
                      x={4}
                      y={y - 11}
                      width={railData.leftStart - 16}
                      height={22}
                      rx={4}
                      fill="transparent"
                    />
                    <circle
                      cx={14}
                      cy={y}
                      r={4}
                      fill={color}
                      opacity={isLaneActive ? 1 : 0.45}
                    />
                    <text
                      x={24}
                      y={y + 4}
                      fontSize="11.5"
                      fontWeight={isLaneActive ? 600 : 400}
                      fill={isLaneActive ? "#0f172a" : "#64748b"}
                    >
                      {shortLabel}
                    </text>
                  </g>
                </g>
              );
            })}

          {/* Real parent-to-child Git edges */}
          {railData.rows.map((row) => {
            const target = railData.positions.get(row.commit.sha);
            if (!target) return null;
            const childActive = isCommitInActiveBranches(
              row.commit.sha,
              branchMeta,
              activeBranches,
            );

            return row.parents.map((parent, parentIndex) => {
              const source = railData.positions.get(parent.sha);
              if (!source) return null;
              const parentActive = isCommitInActiveBranches(
                parent.sha,
                branchMeta,
                activeBranches,
              );
              const bothActive = childActive && parentActive;
              const touchesActive = childActive || parentActive;
              const isMergeSecondary = row.parents.length > 1 && parentIndex > 0;

              const color = isMergeSecondary
                ? (getCommitBranchAccentColor(parent.sha, branchMeta, null) ??
                  BRANCH_PALETTE[parent.lane % BRANCH_PALETTE.length])
                : (getCommitBranchAccentColor(row.commit.sha, branchMeta, null) ??
                  BRANCH_PALETTE[row.lane % BRANCH_PALETTE.length]);
              const midX = (source.x + target.x) / 2;
              const path =
                source.y === target.y
                  ? `M ${source.x} ${source.y} L ${target.x} ${target.y}`
                  : `M ${source.x} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${target.x} ${target.y}`;

              return (
                <path
                  key={`${parent.sha}->${row.commit.sha}`}
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={bothActive ? 2.5 : touchesActive ? 1.85 : 1.75}
                  strokeOpacity={bothActive ? 0.92 : touchesActive ? 0.52 : 0.3}
                  strokeDasharray={!bothActive && touchesActive ? "4 3" : undefined}
                  data-parent={parent.sha}
                />
              );
            });
          })}

          {/* Commit nodes */}
          {railData.rows.map((row, index) => {
            const pos = railData.positions.get(row.commit.sha);
            if (!pos) return null;

            const { sha, subject, parents } = row.commit;
            const number = commitNumbers.get(sha) ?? index + 1;
            const measuredCommit = commitBySha.get(sha);
            const isMerge = parents.length > 1;
            const isFork = railData.forks.has(sha);
            const isActive = isCommitInActiveBranches(sha, branchMeta, activeBranches);
            const commitBranches = branchMeta.commitBranchMap.get(sha) ?? [];
            const branchColor =
              getCommitBranchAccentColor(sha, branchMeta, activeBranches) ??
              getCommitBranchAccentColor(sha, branchMeta, null) ??
              BRANCH_PALETTE[row.lane % BRANCH_PALETTE.length];
            const statusColor = measuredCommit ? getCommitColor(measuredCommit) : "#ffffff";
            const strokeColor = isActive ? branchColor : "#94a3b8";

            const tooltipLines = [
              `Commit ${number}: ${subject}`,
              `Rama: ${commitBranches.length > 0 ? commitBranches.join(", ") : "Rama no registrada"}`,
            ];
            if (isFork) tooltipLines.push("Bifurcación");
            if (isMerge) tooltipLines.push("Merge");
            if (measuredCommit) {
              tooltipLines.push(
                `Tests: ${measuredCommit.test_count} · Cobertura: ${measuredCommit.coverage == null ? "Sin datos" : `${measuredCommit.coverage}%`}`,
              );
            } else {
              tooltipLines.push("Sin métricas registradas");
            }

            const handleActivate = () => {
              if (measuredCommit && onSelectCommit) {
                onSelectCommit(measuredCommit);
              }
            };

            return (
              <g key={sha} data-rail-commit={sha} data-rail-active={isActive ? "true" : "false"}>
                <Tooltip
                  title={
                    <div className="tdd-rail-tooltip">
                      {tooltipLines.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>
                  }
                  placement="top"
                  arrow
                >
                  <g
                    role={measuredCommit ? "button" : "img"}
                    tabIndex={0}
                    aria-label={tooltipLines.join(". ")}
                    style={{ cursor: measuredCommit ? "pointer" : "default" }}
                    onClick={handleActivate}
                    onKeyDown={(event) => {
                      if (measuredCommit && (event.key === "Enter" || event.key === " ")) {
                        event.preventDefault();
                        handleActivate();
                      }
                    }}
                  >
                    <circle cx={pos.x} cy={pos.y} r={13} fill="transparent" />
                    {isFork && isActive && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={9.5}
                        fill="none"
                        stroke={branchColor}
                        strokeOpacity={0.28}
                        strokeWidth={1.5}
                      />
                    )}
                    {isMerge ? (
                      <polygon
                        points={`${pos.x},${pos.y - 7.5} ${pos.x + 7.5},${pos.y} ${pos.x},${pos.y + 7.5} ${pos.x - 7.5},${pos.y}`}
                        fill={measuredCommit ? (isActive ? statusColor : "#e2e8f0") : "#ffffff"}
                        stroke={strokeColor}
                        strokeWidth={2.2}
                      />
                    ) : (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={measuredCommit ? 6.5 : 5.5}
                        fill={measuredCommit ? (isActive ? statusColor : "#e2e8f0") : "#ffffff"}
                        stroke={strokeColor}
                        strokeWidth={measuredCommit ? 2.4 : 2}
                      />
                    )}
                  </g>
                </Tooltip>
                <text
                  x={pos.x}
                  y={railData.labelY}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isActive ? 700 : 400}
                  fill={isActive ? "#1e293b" : "#94a3b8"}
                >
                  #{number}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default TDDBranchRail;
