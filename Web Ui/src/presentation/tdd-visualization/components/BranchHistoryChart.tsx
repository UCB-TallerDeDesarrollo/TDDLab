import { useState } from "react";
import type {
  BranchHistories,
  BranchHistoryCommit,
} from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";

interface BranchHistoryChartProps {
  history: BranchHistories;
}

const width = 1700;
const height = 720;
const left = 150;
const right = 70;
const top = 35;
const bottom = 86;
// Margen interno del área de trazado: evita que los puntos de los extremos
// (y los que se desplazan por solaparse) se monten sobre los ejes o se corten.
const plotPaddingX = 64;
const targetYTicks = 8;
const tooltipWidth = 440;
const tooltipTitleLineHeight = 22;
const tooltipDetailLineHeight = 20;

const branchColors: Record<string, string> = {
  main: "#1E40AF",
  "rama-a": "#0D9488",
  "rama-b": "#2563EB",
  "rama-c": "#7C3AED",
  "rama-d": "#D97706",
  "rama-feature": "#DB2777",
};
const fallbackColors = ["#0891B2", "#4F46E5", "#C026D3", "#EA580C", "#16A34A"];

interface TooltipLine {
  text: string;
  marker?: boolean;
}

interface CommitTooltip {
  x: number;
  y: number;
  titleLines: string[];
  detailLines: TooltipLine[];
}

function wrapText(text: string, maxCharacters: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  words.forEach(word => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxCharacters && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  if (line) lines.push(line);
  return lines.length > 0 ? lines : [""];
}

function formatBoliviaDate(date: Date | null) {
  if (!date || Number.isNaN(date.getTime())) return "No disponible";

  const parts = new Intl.DateTimeFormat("es-BO", {
    timeZone: "America/La_Paz",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(item => item.type === type)?.value ?? "--";

  return `${part("day")}/${part("month")}/${part("year")} ${part("hour")}:${part("minute")}:${part("second")} (hora de Bolivia)`;
}

function displayValue(value: number | null | undefined) {
  return value == null ? "No disponible" : String(value);
}

// Paso "redondo" (1, 2, 5, 10, 20, ...) para que el eje Y tenga pocas marcas
// legibles sin importar cuántos tests tenga el repositorio.
function niceStep(range: number) {
  const raw = Math.max(range, 1) / targetYTicks;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return Math.max(1, factor * magnitude);
}

function shortSha(commit: BranchHistoryCommit) {
  return commit.sha.slice(0, 7);
}

export default function BranchHistoryChart({ history }: Readonly<BranchHistoryChartProps>) {
  const [hoveredCommit, setHoveredCommit] = useState<CommitTooltip | null>(null);
  const branches = history.branches.filter(branch => branch.commits.length > 0);
  const commitsBySha = new Map<string, BranchHistoryCommit>();
  branches.forEach(branch => {
    branch.commits.forEach(commit => commitsBySha.set(commit.sha, commit));
  });

  const orderedCommits = Array.from(commitsBySha.values()).sort((a, b) => {
    if (!a.committedAt || !b.committedAt) return 0;
    return a.committedAt.getTime() - b.committedAt.getTime();
  });
  const executions = branches.flatMap(branch => branch.executions);
  const testCountFor = (commit: BranchHistoryCommit): number | null => {
    if (commit.metrics?.numTotalTests != null) return commit.metrics.numTotalTests;
    const execution = executions
      .filter(item => item.associatedCommitSha === commit.sha)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    return execution?.numTotalTests ?? null;
  };

  if (branches.length === 0 || orderedCommits.length === 0) return null;

  const knownTestCounts = branches.flatMap(branch =>
    branch.commits.map(commit => testCountFor(commit)),
  ).filter((value): value is number => value != null);
  if (knownTestCounts.length === 0) return null;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const commitIndex = new Map(orderedCommits.map((commit, index) => [commit.sha, index]));
  const innerPlotWidth = plotWidth - plotPaddingX * 2;
  const xForIndex = (index: number) =>
    orderedCommits.length === 1
      ? left + plotWidth / 2
      : left + plotPaddingX + (index * innerPlotWidth) / (orderedCommits.length - 1);
  const pointOffsets = new Map<string, number>();
  const overlappingPoints = new Map<string, { sha: string; branchNames: string[] }>();
  branches.forEach(branch => {
    branch.commits.forEach(commit => {
      const value = testCountFor(commit);
      if (value == null) return;
      const pointKey = JSON.stringify([commit.sha, value]);
      const group = overlappingPoints.get(pointKey) ?? { sha: commit.sha, branchNames: [] };
      group.branchNames.push(branch.branch);
      overlappingPoints.set(pointKey, group);
    });
  });
  overlappingPoints.forEach(({ sha, branchNames }) => {
    if (branchNames.length < 2) return;
    branchNames.forEach((branchName, index) => {
      const offset = (index - (branchNames.length - 1) / 2) * 38;
      pointOffsets.set(JSON.stringify([branchName, sha]), offset);
    });
  });
  const xForPoint = (branchName: string, sha: string) =>
    xForIndex(commitIndex.get(sha) ?? 0) +
    (pointOffsets.get(JSON.stringify([branchName, sha])) ?? 0);
  const lowestCount = Math.min(...knownTestCounts);
  const highestCount = Math.max(...knownTestCounts);
  const yStep = niceStep(highestCount - lowestCount);
  // Se deja un paso libre arriba y abajo para que ningún punto quede pegado al borde.
  const yMinimum = Math.max(0, Math.floor(lowestCount / yStep) * yStep - yStep);
  const yMaximum = Math.ceil(highestCount / yStep) * yStep + yStep;
  const yFor = (value: number) =>
    top + ((yMaximum - value) * plotHeight) / (yMaximum - yMinimum);

  const colorFor = (branchName: string, index: number) =>
    branchColors[branchName] ?? fallbackColors[index % fallbackColors.length];

  const createTooltip = (
    branch: (typeof branches)[number],
    commit: BranchHistoryCommit,
    commitPosition: number,
    value: number,
    x: number,
    y: number,
  ): CommitTooltip => {
    const branchExecution = branch.executions
      .filter(item => item.associatedCommitSha === commit.sha)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    const execution = branchExecution ?? executions
      .filter(item => item.associatedCommitSha === commit.sha)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    const date = commit.committedAt ?? (execution ? new Date(execution.timestamp) : null);
    const coverage = commit.metrics?.coveragePercentage ?? execution?.coveragePercentage;
    const conclusion = commit.metrics?.conclusion ?? (
      execution ? (execution.success ? "success" : "failure") : null
    );
    const status = conclusion === "success"
      ? "Exitoso"
      : conclusion === "failure"
        ? "Con fallos"
        : conclusion === "neutral"
          ? "Neutral"
          : "No disponible";
    const title = `Commit ${commitPosition + 1}: ${commit.message}`;
    const detailLines = [
      { text: `Rama: ${branch.branch}` },
      { text: `Total Número de Tests: ${value}`, marker: true },
      { text: `Tests aprobados: ${displayValue(commit.metrics?.numPassedTests ?? execution?.numPassedTests)}` },
      { text: `Tests fallidos: ${displayValue(commit.metrics?.failedTests ?? execution?.failedTests)}` },
      { text: `Líneas de Código Añadido: ${displayValue(commit.stats?.additions)}` },
      { text: `Líneas de Código Eliminado: ${displayValue(commit.stats?.deletions)}` },
      { text: `Total de Cambios: ${displayValue(commit.stats?.total)}` },
      { text: `Fecha: ${formatBoliviaDate(date)}` },
      { text: `Cobertura: ${coverage == null ? "No disponible" : `${coverage}%`}` },
      { text: `Estado: ${status}` },
      { text: `Commit: ${shortSha(commit)}` },
    ].flatMap(line =>
      wrapText(line.text, 48).map((text, index) => ({
        text,
        marker: line.marker && index === 0,
      })),
    );

    return {
      x,
      y,
      titleLines: wrapText(title, 48),
      detailLines,
    };
  };

  const smoothPath = (points: Array<{ sha: string; value: number; xOffset: number }>) => {
    if (points.length === 0) return "";
    const firstIndex = commitIndex.get(points[0].sha) ?? 0;
    let path = `M ${xForIndex(firstIndex) + points[0].xOffset} ${yFor(points[0].value)}`;
    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const current = points[index];
      const previousIndex = commitIndex.get(previous.sha) ?? 0;
      const currentIndex = commitIndex.get(current.sha) ?? previousIndex;
      const previousX = xForIndex(previousIndex) + previous.xOffset;
      const currentX = xForIndex(currentIndex) + current.xOffset;
      const previousY = yFor(previous.value);
      const currentY = yFor(current.value);
      const controlOffset = (currentX - previousX) * 0.45;
      path += ` C ${previousX + controlOffset} ${previousY}, ${currentX - controlOffset} ${currentY}, ${currentX} ${currentY}`;
    }
    return path;
  };

  const yTicks = Array.from(
    { length: Math.round((yMaximum - yMinimum) / yStep) + 1 },
    (_, index) => yMinimum + index * yStep,
  );

  return (
    <section
      aria-label="Historial de commits por ramas"
      style={{
        width: "100%",
        maxWidth: "none",
        margin: "8px auto",
        padding: "12px",
        boxSizing: "border-box",
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div aria-label="Leyenda de ramas" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "18px", minHeight: 34, marginBottom: 4 }}>
        {branches.map((branch, index) => (
          <div key={branch.branch} style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", fontSize: 14, fontWeight: 700 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: colorFor(branch.branch, index), display: "inline-block" }} />
            {branch.branch}
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Grafo de ramas y commits" style={{ width: "100%", height: "auto", background: "#fff", display: "block" }}>
        {yTicks.map(value => {
          const y = yFor(value);
          return (
            <g key={value}>
              <line x1={left} y1={y} x2={width - right} y2={y} stroke="#E5E7EB" strokeWidth="1" />
              <text x={left - 22} y={y + 5} textAnchor="end" fill="#64748B" fontSize="16" fontWeight="600">
                {value}
              </text>
            </g>
          );
        })}
        {orderedCommits.map((commit, index) => {
          const x = xForIndex(index);
          return (
            <line key={`graph-column-${commit.sha}`} x1={x} y1={top} x2={x} y2={height - bottom} stroke="#EEF2F7" strokeWidth="1" />
          );
        })}

        {branches.map((branch, branchIndex) => {
          const branchCommits = branch.commits
            .filter(commit => commitIndex.has(commit.sha))
            .sort((a, b) => (commitIndex.get(a.sha) ?? 0) - (commitIndex.get(b.sha) ?? 0))
            .map(commit => ({
              sha: commit.sha,
              value: testCountFor(commit),
              xOffset: pointOffsets.get(JSON.stringify([branch.branch, commit.sha])) ?? 0,
            }));
          const segments: Array<Array<{ sha: string; value: number; xOffset: number }>> = [];
          branchCommits.forEach(point => {
            if (point.value == null) {
              if (segments.length > 0 && segments[segments.length - 1].length === 0) return;
              segments.push([]);
            } else {
              if (segments.length === 0) segments.push([]);
              segments[segments.length - 1].push({
                sha: point.sha,
                value: point.value,
                xOffset: point.xOffset,
              });
            }
          });
          return segments.filter(segment => segment.length > 0).map((segment, segmentIndex) => (
            <path
              key={`${branch.branch}-line-${segmentIndex}`}
              d={smoothPath(segment)}
              fill="none"
              stroke={colorFor(branch.branch, branchIndex)}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ));
        })}

        {branches.map((branch, branchIndex) =>
          branch.commits.map(commit => {
            const commitPosition = commitIndex.get(commit.sha);
            if (commitPosition == null) return null;
            const value = testCountFor(commit);
            if (value == null) return null;
            const x = xForPoint(branch.branch, commit.sha);
            const y = yFor(value);
            const color = colorFor(branch.branch, branchIndex);
            return (
              <g
                key={`${branch.branch}-${commit.sha}`}
                role="img"
                tabIndex={0}
                aria-label={`Commit ${commitPosition + 1} en ${branch.branch}: ${commit.message}. ${value} tests`}
                aria-describedby={hoveredCommit ? "commit-details-tooltip" : undefined}
                onMouseEnter={() => setHoveredCommit(createTooltip(branch, commit, commitPosition, value, x, y))}
                onMouseLeave={() => setHoveredCommit(null)}
                onFocus={() => setHoveredCommit(createTooltip(branch, commit, commitPosition, value, x, y))}
                onBlur={() => setHoveredCommit(null)}
                style={{ cursor: "pointer", outline: "none" }}
              >
                <title>{`${branch.branch} · Commit ${commitPosition + 1} · ${value} tests · ${shortSha(commit)}`}</title>
                <circle cx={x} cy={y} r="19" fill={color} stroke="#fff" strokeWidth="3" />
                <text x={x} y={y + 6} textAnchor="middle" fill="#fff" fontSize="16" fontWeight="800">
                  {value}
                </text>
              </g>
            );
          }),
        )}

        {orderedCommits.map((commit, index) => (
          <text key={`commit-label-${commit.sha}`} x={xForIndex(index)} y={height - 48} textAnchor="middle" fill="#475569" fontSize="15" fontWeight="700">
            Commit {index + 1}
          </text>
        ))}
        <text x={width / 2} y={height - 10} textAnchor="middle" fill="#334155" fontSize="17" fontWeight="700">
          Commits Realizados
        </text>
        <text x="28" y={top + plotHeight / 2} textAnchor="middle" fill="#334155" fontSize="17" fontWeight="700" transform={`rotate(-90 28 ${top + plotHeight / 2})`}>
          Número de Tests
        </text>

        {hoveredCommit && (() => {
          const tooltipHeight = 36
            + hoveredCommit.titleLines.length * tooltipTitleLineHeight
            + hoveredCommit.detailLines.length * tooltipDetailLineHeight;
          const tooltipX = hoveredCommit.x + tooltipWidth + 24 <= width - 8
            ? hoveredCommit.x + 24
            : hoveredCommit.x - tooltipWidth - 24;
          const proposedY = hoveredCommit.y - tooltipHeight - 20;
          const tooltipY = Math.max(
            8,
            Math.min(
              proposedY >= 8 ? proposedY : hoveredCommit.y + 22,
              height - tooltipHeight - 8,
            ),
          );
          const titleStartY = tooltipY + 24;
          const detailsStartY = titleStartY
            + hoveredCommit.titleLines.length * tooltipTitleLineHeight
            + 7;

          return (
            <g id="commit-details-tooltip" role="tooltip" pointerEvents="none">
              <rect
                x={tooltipX}
                y={tooltipY}
                width={tooltipWidth}
                height={tooltipHeight}
                rx="9"
                fill="#292929"
                fillOpacity="0.96"
              />
              <text x={tooltipX + 12} y={titleStartY} fill="#fff" fontSize="17" fontWeight="700">
                {hoveredCommit.titleLines.map((line, index) => (
                  <tspan key={`tooltip-title-${index}`} x={tooltipX + 12} dy={index === 0 ? 0 : tooltipTitleLineHeight}>
                    {line}
                  </tspan>
                ))}
              </text>
              {hoveredCommit.detailLines.map((line, index) => {
                const y = detailsStartY + index * tooltipDetailLineHeight;
                return (
                  <g key={`tooltip-detail-${index}`}>
                    {line.marker && (
                      <rect x={tooltipX + 12} y={y - 13} width="14" height="14" fill="#16A34A" stroke="#fff" strokeWidth="1" />
                    )}
                    <text
                      x={tooltipX + (line.marker ? 34 : 12)}
                      y={y}
                      fill="#fff"
                      fontSize="16"
                      fontWeight={line.marker ? "600" : "400"}
                    >
                      {line.text}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })()}
      </svg>
    </section>
  );
}
