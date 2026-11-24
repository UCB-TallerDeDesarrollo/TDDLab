import type { TDDChartSummary as TDDChartSummaryData } from "../../types/tddVisualization.types";

interface TDDChartSummaryProps {
  summary: TDDChartSummaryData;
}

export function TDDChartSummary({ summary }: TDDChartSummaryProps) {
  const items = [
    {
      key: "commits",
      label: "Total de commits",
      value: summary.totalCommits,
      tone: "default",
    },
    {
      key: "executions",
      label: "Total de ejecuciones",
      value: summary.totalExecutions,
      tone: "default",
    },
    {
      key: "passed",
      label: "Exitosas",
      value: summary.totalPassed,
      tone: "success",
    },
    {
      key: "failed",
      label: "Fallidas",
      value: summary.totalFailed,
      tone: "failure",
    },
  ] as const;

  return (
    <section className="tdd-dashboard__summary" aria-label="Resumen de ejecuciones TDD">
      {items.map((item) => (
        <div key={item.key} className="tdd-dashboard__summary-card">
          <div className="tdd-dashboard__summary-label">{item.label}</div>
          <div
            className={`tdd-dashboard__summary-value tdd-dashboard__summary-value--${item.tone}`}
            data-testid={`tdd-summary-${item.key}`}
          >
            {item.value}
          </div>
        </div>
      ))}
    </section>
  );
}
