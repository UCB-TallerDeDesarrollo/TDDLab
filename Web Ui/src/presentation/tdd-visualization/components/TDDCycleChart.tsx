import React, { useMemo } from 'react';
import { CHART_SYMBOL_VARIANT, chartSymbols } from './chartSymbols';

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
  tests: Array<{ passed: boolean; size: number; detail: string }>;
}

const TDDCycleChart: React.FC<TDDCycleChartProps> = ({ data = [] }) => {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    const commitMap = new Map<number, CommitData>();
    let currentCommit = 1;

    for (const log of data){
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
        const status = passed ? 'exitosa' : 'con fallos';
        commit.tests.push({
          passed,
          size: 1,
          detail: `Ejecución ${status}: ${log.numPassedTests} pruebas exitosas, ${log.failedTests} fallidas de ${log.numTotalTests}.`,
        });
      }
    };
    
    return Array.from(commitMap.values());
  }, [data]);

  const chartHeight = 400;
  const chartWidth = 1200;
  const leftPadding = 60;
  const rightPadding = 60;
  const topPadding = 40;
  const bottomPadding = 80;
  const plotWidth = chartWidth - leftPadding - rightPadding;
  const plotHeight = chartHeight - topPadding - bottomPadding;
  
  const commitSpacing = plotWidth / (processedData.length + 1);
  const markerSize = chartSymbols.success.size;
  const markerRadius = markerSize / 2;
  const circleSpacing = 8;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Ciclo de Ejecución de Pruebas TDD</h2>
      </div>
      
      <svg width={chartWidth} height={chartHeight} style={styles.svg}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <line
            key={`grid-${i}`}
            x1={leftPadding}
            y1={topPadding + (plotHeight / 7) * i}
            x2={leftPadding + plotWidth}
            y2={topPadding + (plotHeight / 7) * i}
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
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <text
            key={`y-tick-${i}`}
            x={leftPadding - 10}
            y={topPadding + plotHeight - (plotHeight / 7) * i + 5}
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
            <g key={`commit-${commitIndex}`}>
              {commit.tests.map((test, testIndex) => {
                const y = topPadding + plotHeight - (testIndex * (markerSize + circleSpacing)) - markerRadius;
                const symbolConfig = test.passed ? chartSymbols.success : chartSymbols.failure;
                
                return (
                  <g
                    key={`test-${commitIndex}-${testIndex}`}
                    role="img"
                    aria-label={test.passed ? 'Ejecución exitosa' : 'Ejecución con fallos'}
                  >
                    <title>{test.detail}</title>
                    <circle
                      cx={x}
                      cy={y}
                      r={markerRadius}
                      fill="transparent"
                      stroke="none"
                    />
                    {CHART_SYMBOL_VARIANT === 'circle' && (
                      <circle
                        cx={x}
                        cy={y}
                        r={markerRadius}
                        fill={symbolConfig.color}
                        opacity="0.9"
                      />
                    )}
                    <text
                      x={x}
                      y={y}
                      fill={CHART_SYMBOL_VARIANT === 'circle' ? '#ffffff' : symbolConfig.color}
                      fontSize={symbolConfig.size}
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                      stroke={CHART_SYMBOL_VARIANT === 'circle' ? '#ffffff' : symbolConfig.color}
                      strokeWidth={symbolConfig.strokeWidth}
                      paintOrder="stroke"
                    >
                      {symbolConfig.symbol}
                    </text>
                  </g>
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
            y={topPadding + plotHeight + 25}
            fill="#666"
            fontSize="12"
            textAnchor="middle"
            transform={`rotate(-45, ${leftPadding + (index + 1) * commitSpacing}, ${topPadding + plotHeight + 25})`}
          >
            Commit {commit.commitNumber}
          </text>
        ))}

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
                {CHART_SYMBOL_VARIANT === 'circle' && (
                  <circle
                    cx={config.size / 2}
                    cy={config.size / 2}
                    r={config.size / 2}
                    fill={config.color}
                    opacity="0.9"
                  />
                )}
                <text
                  x={config.size / 2}
                  y={config.size / 2}
                  fill={CHART_SYMBOL_VARIANT === 'circle' ? '#ffffff' : config.color}
                  fontSize={config.size}
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                  stroke={CHART_SYMBOL_VARIANT === 'circle' ? '#ffffff' : config.color}
                  strokeWidth={config.strokeWidth}
                  paintOrder="stroke"
                >
                  {config.symbol}
                </text>
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