import { useState } from "react";
import type { FocusEvent, MouseEvent } from "react";
import type { TDDChartPoint } from "../../types/tddVisualization.types";
import { CHART_FAILURE_COLOR, CHART_SUCCESS_COLOR } from "../chartSymbols";
import { TDD_DASHBOARD_LAYOUT as LAYOUT } from "./dashboard.constants";
import { TDDEmptyState } from "./TDDEmptyState";
import { TDDExecutionTooltip } from "./TDDExecutionTooltip";

interface TDDExecutionChartProps {
  data: TDDChartPoint[];
  branchName: string;
}

interface TooltipState {
  detail: string;
  x: number;
  y: number;
}

export function TDDExecutionChart({ data, branchName }: TDDExecutionChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const allTests = data.flatMap((commit) => commit.tests);

  if (!allTests.length) {
    return (
      <TDDEmptyState
        title="No se tiene ejecución de pruebas"
        description="Esta rama todavía no tiene ejecuciones TDD registradas."
      />
    );
  }

  const chartWidth = Math.max(
    LAYOUT.minChartWidth,
    data.length * LAYOUT.commitColumnWidth + LAYOUT.chartExtraWidth,
  );
  const plotWidth = chartWidth - LAYOUT.chartLeft - LAYOUT.chartRight;
  const plotHeight = LAYOUT.chartHeight - LAYOUT.chartTop - LAYOUT.chartBottom;
  const maxExecutions = Math.max(1, ...data.map((commit) => commit.tests.length));
  const tickCount = Math.min(7, maxExecutions);
  const spacing = plotWidth / (data.length + 1);
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => index);

  const showAtPointer = (event: MouseEvent<SVGGElement>, detail: string) => {
    setTooltip({ detail, x: event.clientX, y: event.clientY });
  };

  const moveAtPointer = (event: MouseEvent<SVGGElement>) => {
    setTooltip((current) =>
      current
        ? { ...current, x: event.clientX, y: event.clientY }
        : current,
    );
  };

  const showAtFocus = (event: FocusEvent<SVGGElement>, detail: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      detail,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  return (
    <>
      <div className="tdd-dashboard__chart-wrapper">
        <svg
          className="tdd-dashboard__tdd-svg"
          viewBox={`0 0 ${chartWidth} ${LAYOUT.chartHeight}`}
          role="img"
          aria-label={`Ejecuciones TDD de ${branchName}`}
        >
          {ticks.map((tick) => {
            const y =
              LAYOUT.chartTop +
              plotHeight -
              (plotHeight / tickCount) * tick;
            const value = Math.round((maxExecutions / tickCount) * tick);

            return (
              <g key={`tick-${tick}`}>
                <line
                  className="tdd-dashboard__grid-line"
                  x1={LAYOUT.chartLeft}
                  y1={y}
                  x2={chartWidth - LAYOUT.chartRight}
                  y2={y}
                />
                <text
                  className="tdd-dashboard__axis-text"
                  x={LAYOUT.chartLeft - 12}
                  y={y + 4}
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            );
          })}

          <line
            className="tdd-dashboard__axis-line"
            x1={LAYOUT.chartLeft}
            y1={LAYOUT.chartTop}
            x2={LAYOUT.chartLeft}
            y2={LAYOUT.chartTop + plotHeight}
          />
          <line
            className="tdd-dashboard__axis-line"
            x1={LAYOUT.chartLeft}
            y1={LAYOUT.chartTop + plotHeight}
            x2={chartWidth - LAYOUT.chartRight}
            y2={LAYOUT.chartTop + plotHeight}
          />
          <text
            className="tdd-dashboard__axis-text"
            x={17}
            y={LAYOUT.chartTop + plotHeight / 2}
            transform={`rotate(-90 17 ${LAYOUT.chartTop + plotHeight / 2})`}
            textAnchor="middle"
          >
            Ejecuciones por commit
          </text>
          <text
            className="tdd-dashboard__axis-text"
            x={LAYOUT.chartLeft + plotWidth / 2}
            y={LAYOUT.chartHeight - 10}
            textAnchor="middle"
          >
            Commits
          </text>

          {data.map((commit, index) => {
            const x = LAYOUT.chartLeft + (index + 1) * spacing;
            const labelY = LAYOUT.chartTop + plotHeight + 25;

            return (
              <g key={commit.sha}>
                {commit.tests.map((test, testIndex) => {
                  const y =
                    LAYOUT.chartTop +
                    plotHeight -
                    LAYOUT.markerSize / 2 -
                    testIndex * (LAYOUT.markerSize + LAYOUT.markerSpacing);
                  const color = test.passed
                    ? CHART_SUCCESS_COLOR
                    : CHART_FAILURE_COLOR;

                  return (
                    <g
                      key={test.testId}
                      className="tdd-dashboard__chart-marker"
                      role="img"
                      aria-label={test.detail}
                      tabIndex={0}
                      onMouseEnter={(event) =>
                        showAtPointer(event, test.detail)
                      }
                      onMouseMove={moveAtPointer}
                      onMouseLeave={() => setTooltip(null)}
                      onFocus={(event) => showAtFocus(event, test.detail)}
                      onBlur={() => setTooltip(null)}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={LAYOUT.markerSize / 2}
                        fill={color}
                      />
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="bold"
                        fill="#fff"
                        pointerEvents="none"
                      >
                        {test.passed ? "✓" : "×"}
                      </text>
                    </g>
                  );
                })}

                <text
                  className="tdd-dashboard__axis-text"
                  x={x}
                  y={labelY}
                  textAnchor="middle"
                  transform={`rotate(-40 ${x} ${labelY})`}
                >
                  Commit {commit.commitNumber}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <section className="tdd-dashboard__legend" aria-label="Leyenda">
        <h3>Leyenda</h3>
        <div className="tdd-dashboard__legend-list">
          <div className="tdd-dashboard__legend-item">
            <span
              className="tdd-dashboard__legend-symbol tdd-dashboard__legend-symbol--success"
              aria-hidden="true"
            >
              ✓
            </span>
            Ejecución exitosa
          </div>
          <div className="tdd-dashboard__legend-item">
            <span
              className="tdd-dashboard__legend-symbol tdd-dashboard__legend-symbol--failure"
              aria-hidden="true"
            >
              ×
            </span>
            Ejecución con fallos
          </div>
        </div>
      </section>

      <TDDExecutionTooltip
        detail={tooltip?.detail ?? null}
        x={tooltip?.x ?? 0}
        y={tooltip?.y ?? 0}
      />
    </>
  );
}
