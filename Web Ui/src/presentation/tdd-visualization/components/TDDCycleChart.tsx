import React, { useMemo } from 'react';

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
}

interface CommitData {
  commitNumber: number;
  tests: Array<{ passed: boolean; size: number }>;
}

const TDDCycleChart: React.FC<TDDCycleChartProps> = ({ data = [] }) => {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const commitMap = new Map<number, CommitData>();
    let currentCommit = 1;

    for (const log of data) {
      if (log.commitId) {
        currentCommit++;
      }

      if (log.numPassedTests !== undefined) {
        if (!commitMap.has(currentCommit)) {
          commitMap.set(currentCommit, {
            commitNumber: currentCommit,
            tests: []
          });
        }

        const commit = commitMap.get(currentCommit)!;
        const passed = (log.failedTests === 0) && (log.success === true);
        commit.tests.push({ passed, size: 1 });
      }
    };

    return Array.from(commitMap.values());
  }, [data]);

  const chartHeight = 500;
  const chartWidth = 1200;
  const leftPadding = 70;
  const rightPadding = 60;
  const topPadding = 40;
  const bottomPadding = 135;
  const plotWidth = chartWidth - leftPadding - rightPadding;
  const plotHeight = chartHeight - topPadding - bottomPadding;

  const commitSpacing = plotWidth / (processedData.length + 1);
  const circleRadius = 15;
  const circleSpacing = 8;
  const bottomMargin = 8;
  const maxTicks = 8;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Ciclo de Ejecución de Pruebas TDD</h2>
      </div>

      <svg width={chartWidth} height={chartHeight} style={styles.svg}>
        {/* Grid lines */}
        {Array.from({ length: maxTicks + 1 }, (_, i) => (
          <line
            key={`grid-${i}`}
            x1={leftPadding}
            y1={topPadding + (plotHeight / maxTicks) * i}
            x2={leftPadding + plotWidth}
            y2={topPadding + (plotHeight / maxTicks) * i}
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
          stroke="#111827"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* X-axis */}
        <line
          x1={leftPadding}
          y1={topPadding + plotHeight}
          x2={leftPadding + plotWidth}
          y2={topPadding + plotHeight}
          stroke="#111827"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Y-axis label */}
        <text
          x={22}
          y={topPadding + plotHeight / 2}
          fill="#111827"
          fontSize="15"
          fontWeight="600"
          textAnchor="middle"
          transform={`rotate(-90, 22, ${topPadding + plotHeight / 2})`}
        >
          Pruebas ejecutadas
        </text>

        {/* Y-axis ticks */}
        {Array.from({ length: maxTicks + 1 }, (_, i) => (
          <text
            key={`y-tick-${i}`}
            x={leftPadding - 12}
            y={topPadding + plotHeight - (plotHeight / maxTicks) * i + 5}
            fill="#111827"
            fontSize="14"
            fontWeight="600"
            textAnchor="end"
          >
            {i}
          </text>
        ))}

        {/* Data points - stacked vertically icons */}
        {processedData.map((commit, commitIndex) => {
          const x = leftPadding + (commitIndex + 1) * commitSpacing;

          return (
            <g key={`commit-${commitIndex}`}>
              {commit.tests.map((test, testIndex) => {
                const y =
                  topPadding +
                  plotHeight -
                  bottomMargin -
                  testIndex * (circleRadius * 2 + circleSpacing) -
                  circleRadius;

                return test.passed ? (
                  <image
                    key={`test-${commitIndex}-${testIndex}`}
                    href="/successful-test.svg"
                    x={x - circleRadius}
                    y={y - circleRadius}
                    width={circleRadius * 2}
                    height={circleRadius * 2}
                  />
                ) : (
                  <image
                    key={`test-${commitIndex}-${testIndex}`}
                    href="/failed-test.svg"
                    x={x - circleRadius}
                    y={y - circleRadius}
                    width={circleRadius * 2}
                    height={circleRadius * 2}
                  />
                );
              })}
            </g>
          );
        })}

        {/* X-axis labels */}
        {processedData.map((commit, index) => (
          <text
            key={`x-label-${index}`}
            x={leftPadding + (index + 1) * commitSpacing}
            y={topPadding + plotHeight + 12}
            fill="#475569"
            fontSize="11.5"
            fontWeight="500"
            letterSpacing="0.2px"
            textAnchor="end"
            transform={`rotate(-90, ${leftPadding + (index + 1) * commitSpacing}, ${topPadding + plotHeight + 12})`}
          >
            Commit {commit.commitNumber}
          </text>
        ))}

        {/* X-axis title */}
        <text
          x={leftPadding + plotWidth / 2}
          y={chartHeight - 16}
          fill="#111827"
          fontSize="16"
          fontWeight="bold"
          letterSpacing="0.5px"
          textAnchor="middle"
        >
          Commits
        </text>
      </svg>

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <img src="/successful-test.svg" alt="Pruebas exitosas" style={styles.legendIcon} />
          <span style={styles.legendText}>Pruebas exitosas</span>
        </div>
        <div style={styles.legendItem}>
          <img src="/failed-test.svg" alt="Pruebas fallidas" style={styles.legendIcon} />
          <span style={styles.legendText}>Pruebas fallidas</span>
        </div>
      </div>

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
    padding: '20px',
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
  svg: {
    display: 'block',
    margin: '0 auto',
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  legendCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
  },
  legendIcon: {
    width: '24px',
    height: '24px',
  },
  legendText: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  summary: {
    display: 'flex',
    justifyContent: 'space-around',
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