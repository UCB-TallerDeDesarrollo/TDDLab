import { indexCommitShas, testResult } from "../../../modules/TDDCycles-Visualization/application/commitExecutions";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CHART_SYMBOL_VARIANT, chartSymbols } from './chartSymbols';
import type { GitGraphCommit } from '../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces';
import {
  type BranchMetadata,
  buildBranchMetadata,
  getCommitBranchAccentColor,
  isCommitInActiveBranches,
} from './branchVisualization';

interface TestLog {
  numPassedTests?: number;
  failedTests?: number;
  numTotalTests?: number;
  timestamp?: number;
  success?: boolean;
  testId: number;
  commitId?: string;
  commitName?: string;
  commitTimestamp?: number;
}

interface TDDCycleChartProps {
  data: TestLog[];
  commitNumbers?: ReadonlyMap<string, number>;
  gitGraph?: GitGraphCommit[];
  branchMeta?: BranchMetadata;
  activeBranches?: ReadonlySet<string> | null;
  logsError?: boolean;
}

interface CommitData {
  key: string;
  sha?: string;
  commitNumber: number;
  isActive: boolean;
  accentColor?: string;
  branches: string[];
  tests: Array<{ passed: boolean | undefined; size: number; detail: string }>;
}

type ChartSymbolConfig = typeof chartSymbols.success | typeof chartSymbols.failure;

interface ChartSymbolMarkProps {
  config: ChartSymbolConfig;
  x: number;
  y: number;
}

const ChartSymbolMark: React.FC<ChartSymbolMarkProps> = ({ config, x, y }) => {
  const symbolColor = CHART_SYMBOL_VARIANT === 'circle' ? '#ffffff' : config.color;
  const halfSymbolSize = config.symbolSize / 2;
  const symbolPath = config.symbol === 'check'
    ? `M ${x - halfSymbolSize * 0.65} ${y - halfSymbolSize * 0.05} L ${x - halfSymbolSize * 0.15} ${y + halfSymbolSize * 0.5} L ${x + halfSymbolSize * 0.7} ${y - halfSymbolSize * 0.6}`
    : `M ${x - halfSymbolSize * 0.55} ${y - halfSymbolSize * 0.55} L ${x + halfSymbolSize * 0.55} ${y + halfSymbolSize * 0.55} M ${x + halfSymbolSize * 0.55} ${y - halfSymbolSize * 0.55} L ${x - halfSymbolSize * 0.55} ${y + halfSymbolSize * 0.55}`;

  return (
    <>
      {CHART_SYMBOL_VARIANT === 'circle' && (
        <circle
          cx={x}
          cy={y}
          r={config.size / 2}
          fill={config.color}
          opacity="0.9"
        />
      )}
      <path
        d={symbolPath}
        fill="none"
        stroke={symbolColor}
        strokeWidth={config.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
};

const TDDCycleChart: React.FC<TDDCycleChartProps> = ({
  data = [],
  commitNumbers,
  gitGraph,
  branchMeta: externalBranchMeta,
  activeBranches = null,
  logsError = false,
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [hoveredTest, setHoveredTest] = useState<{
    x: number;
    y: number;
    detail: string;
  } | null>(null);

  const fallbackBranchMeta = useMemo(() => buildBranchMetadata(gitGraph), [gitGraph]);
  const branchMeta = externalBranchMeta ?? fallbackBranchMeta;

  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const uniqueCommitByTestId = indexCommitShas(data);

    const bySha = new Map<string, CommitData>();
    const fallbackOrder = new Map<string, number>();
    let nextFallbackNumber = 1;

    for (const log of data) {
      if (log.numPassedTests === undefined) continue;
      const sha = uniqueCommitByTestId.get(log.testId);
      const key = sha ?? `unlinked-${log.testId}`;
      if (!bySha.has(key)) {
        let number = sha ? commitNumbers?.get(sha) : undefined;
        if (number === undefined) {
          if (!fallbackOrder.has(key)) {
            fallbackOrder.set(key, nextFallbackNumber++);
          }
          number = fallbackOrder.get(key)!;
        }
        const commitBranches = sha ? (branchMeta.commitBranchMap.get(sha) ?? []) : [];
        const isActive = sha
          ? isCommitInActiveBranches(sha, branchMeta, activeBranches)
          : activeBranches === null;
        const accentColor = sha
          ? getCommitBranchAccentColor(sha, branchMeta, activeBranches)
          : undefined;

        bySha.set(key, {
          key,
          sha,
          commitNumber: number,
          isActive,
          accentColor,
          branches: commitBranches,
          tests: [],
        });
      }

      const entry = bySha.get(key)!;
      const result = testResult(log);
      const passed = result === "unknown" ? undefined : result === "success";
      const status = passed === undefined ? 'sin resultado' : passed ? 'exitosa' : 'con fallos';
      const branchSuffix = entry.branches.length > 0 ? ` Rama: ${entry.branches.join(', ')}.` : '';
      entry.tests.push({
        passed,
        size: 1,
        detail: `Ejecución ${status}: ${log.numPassedTests} pruebas exitosas, ${log.failedTests} fallidas de ${log.numTotalTests}.${branchSuffix}`,
      });
    }

    return Array.from(bySha.values()).sort((a, b) => a.commitNumber - b.commitNumber);
  }, [data, commitNumbers, branchMeta, activeBranches]);

  const hasExecutions = processedData.length > 0;
  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;

    const updateWidth = () => setAvailableWidth(plot.clientWidth);
    updateWidth();
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(updateWidth);
    observer.observe(plot);
    return () => observer.disconnect();
  }, [hasExecutions]);

  if (!hasExecutions) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Ciclo de Ejecución de Pruebas TDD</h2>
        </div>
        {logsError ? (
          <div role="alert" style={styles.errorState}>
            <h3 style={styles.emptyStateTitle}>No se pudieron cargar las ejecuciones de pruebas</h3>
          </div>
        ) : (
          <div role="status" style={styles.emptyState}>
            <h3 style={styles.emptyStateTitle}>No se tiene ejecución de pruebas</h3>
          </div>
        )}
      </div>
    );
  }

  const leftPadding = 52;
  const rightPadding = 20;
  const topPadding = 40;
  const bottomPadding = 84;
  const markerSize = chartSymbols.success.size;
  const markerRadius = markerSize / 2;
  const markerSpacing = markerSize + 8;
  const mostExecutions = processedData.reduce((count, commit) => Math.max(count, commit.tests.length), 7);
  const tickStep = Math.ceil(mostExecutions / 7);
  const tickCount = Math.ceil(mostExecutions / tickStep);
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => i * tickStep);
  const maxTick = tickCount * tickStep;
  const plotHeight = maxTick * markerSpacing;
  const chartHeight = plotHeight + topPadding + bottomPadding;

  const viewportWidth = availableWidth || 760;
  const minPlotWidth = (processedData.length + 1) * 56;
  const chartWidth = Math.max(viewportWidth, minPlotWidth + leftPadding + rightPadding);
  const plotWidth = chartWidth - leftPadding - rightPadding;
  const commitSpacing = plotWidth / (processedData.length + 1);
  const tooltipWidth = Math.min(360, viewportWidth - 16);
  const scrollLeft = plotRef.current?.scrollLeft ?? 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Ciclo de Ejecución de Pruebas TDD</h2>
      </div>

      <div
        ref={plotRef}
        className="tdd-cycle-plot"
        style={styles.plot}
        onScroll={() => setHoveredTest(null)}
      >
        <svg width={chartWidth} height={chartHeight} style={styles.svg}>
          {/* Grid lines */}
          {yTicks.map(i => (
            <line
              key={`grid-${i}`}
              x1={leftPadding}
              y1={topPadding + plotHeight - i * markerSpacing}
              x2={leftPadding + plotWidth}
              y2={topPadding + plotHeight - i * markerSpacing}
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis */}
          <line
            x1={leftPadding}
            y1={topPadding}
            x2={leftPadding}
            y2={topPadding + plotHeight}
            stroke="#333"
            strokeWidth="2"
          />

          {/* X-axis */}
          <line
            x1={leftPadding}
            y1={topPadding + plotHeight}
            x2={leftPadding + plotWidth}
            y2={topPadding + plotHeight}
            stroke="#333"
            strokeWidth="2"
          />

          {/* Y-axis label */}
          <text
            x={20}
            y={topPadding + plotHeight / 2}
            fill="#666"
            fontSize="14"
            textAnchor="middle"
            transform={`rotate(-90, 20, ${topPadding + plotHeight / 2})`}
          >
            Pruebas ejecutadas
          </text>

          {/* Y-axis ticks */}
          {yTicks.map(i => (
            <text
              key={`y-tick-${i}`}
              x={leftPadding - 10}
              y={topPadding + plotHeight - i * markerSpacing + 5}
              fill="#666"
              fontSize="12"
              textAnchor="end"
            >
              {i}
            </text>
          ))}

          {/* Data points - circles stacked vertically */}
          {processedData.map((commit, commitIndex) => {
            const x = leftPadding + (commitIndex + 1) * commitSpacing;

            return (
              <g
                key={commit.key}
                data-cycle-commit={commit.sha}
                data-cycle-active={commit.isActive ? 'true' : 'false'}
                opacity={commit.isActive ? 1 : 0.22}
              >
                {commit.tests.map((test, testIndex) => {
                  const y = topPadding + plotHeight - (testIndex * markerSpacing) - markerRadius;
                  const symbolConfig = test.passed ? chartSymbols.success : chartSymbols.failure;

                  return (
                    <g
                      key={`test-${commit.key}-${testIndex}`}
                      role="img"
                      aria-label={test.passed === undefined ? 'Ejecución sin resultado' : test.passed ? 'Ejecución exitosa' : 'Ejecución con fallos'}
                      tabIndex={0}
                      onMouseEnter={() => setHoveredTest({ x, y, detail: test.detail })}
                      onMouseLeave={() => setHoveredTest(null)}
                      onFocus={() => setHoveredTest({ x, y, detail: test.detail })}
                      onBlur={() => setHoveredTest(null)}
                      onClick={() => setHoveredTest({ x, y, detail: test.detail })}
                    >
                      <title>{test.detail}</title>
                      <circle
                        cx={x}
                        cy={y}
                        r={markerRadius}
                        fill="transparent"
                        stroke="none"
                      />
                      {test.passed === undefined ? <circle cx={x} cy={y} r={5} fill="#627384" /> : <ChartSymbolMark config={symbolConfig} x={x} y={y} />}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* X-axis labels */}
          {processedData.map((commit, index) => {
            const x = leftPadding + (index + 1) * commitSpacing;
            return (
              <g key={`x-label-${commit.key}`} opacity={commit.isActive ? 1 : 0.35}>
                {branchMeta.branches.length > 1 && commit.accentColor && (
                  <circle
                    cx={x}
                    cy={topPadding + plotHeight + 8}
                    r={3.5}
                    fill={commit.accentColor}
                  />
                )}
                <text
                  x={x}
                  y={topPadding + plotHeight + 28}
                  fill="#666"
                  fontSize="12"
                  fontWeight={commit.isActive && activeBranches !== null ? 600 : 400}
                  textAnchor="middle"
                  transform={`rotate(-45, ${x}, ${topPadding + plotHeight + 28})`}
                >
                  {commit.sha ? "Commit " + commit.commitNumber : "Sin vínculo"}
                </text>
              </g>
            );
          })}

          {/* X-axis title */}
          <text
            x={leftPadding + plotWidth / 2}
            y={chartHeight - 15}
            fill="#666"
            fontSize="14"
            textAnchor="middle"
          >
            Commits
          </text>
        </svg>
        {hoveredTest && (
          <div
            role="tooltip"
            style={{
              ...styles.tooltip,
              width: tooltipWidth,
              left: Math.max(scrollLeft + 8, Math.min(
                hoveredTest.x - tooltipWidth / 2, scrollLeft + viewportWidth - tooltipWidth - 8,
              )),
              top: Math.max(6, hoveredTest.y - 65),
            }}
          >
            {hoveredTest.detail}
          </div>
        )}
      </div>

      <section style={styles.legend} aria-label="Leyenda de resultados de ejecución">
        <h3 style={styles.legendTitle}>Leyenda</h3>
        <ul style={styles.legendList}>
          {[
            { config: chartSymbols.success, label: 'Ejecución exitosa' },
            { config: chartSymbols.failure, label: 'Ejecución con fallos' },
          ].map(({ config, label }) => (
            <li key={label} style={styles.legendItem}>
              <svg
                width={config.size}
                height={config.size}
                viewBox={`0 0 ${config.size} ${config.size}`}
                aria-hidden="true"
                focusable="false"
              >
                <ChartSymbolMark
                  config={config}
                  x={config.size / 2}
                  y={config.size / 2}
                />
              </svg>
              <span style={styles.legendText}>{label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Summary */}
      <div style={styles.summary}>
        <div style={styles.summaryItem}>
          <strong>Total de commits:</strong> {processedData.length}
        </div>
        <div style={styles.summaryItem}>
          <strong>Total de ejecuciones:</strong> {data.filter(d => d.numPassedTests !== undefined).length}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'clamp(12px, 2vw, 20px)',
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    maxWidth: '1300px',
    margin: '20px auto',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 10px 0',
  },
  emptyState: {
    padding: '20px',
    color: '#333',
    backgroundColor: '#f5f8fc',
    border: '1px solid #b8cde0',
    borderRadius: '6px',
    lineHeight: 1.5,
    overflowWrap: 'anywhere',
  },
  errorState: {
    padding: '20px',
    color: '#7f1d1d',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    lineHeight: 1.5,
    overflowWrap: 'anywhere',
  },
  emptyStateTitle: {
    margin: 0,
    fontSize: '18px',
  },
  plot: {
    position: 'relative',
    overflowX: 'auto',
  },
  svg: {
    display: 'block',
  },
  tooltip: {
    position: 'absolute',
    pointerEvents: 'none',
    boxSizing: 'border-box',
    padding: '8px 10px',
    borderRadius: '4px',
    backgroundColor: '#333',
    color: '#fff',
    fontSize: '12px',
    overflowWrap: 'anywhere',
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '100%',
  },
  legendTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#333',
  },
  legendList: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '16px 30px',
    padding: 0,
    margin: 0,
    listStyle: 'none',
    width: '100%',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
  legendText: {
    fontSize: '14px',
    color: '#333',
  },
  summary: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
  },
  summaryItem: {
    fontSize: '14px',
    color: '#666',
  },
};

export default TDDCycleChart;
