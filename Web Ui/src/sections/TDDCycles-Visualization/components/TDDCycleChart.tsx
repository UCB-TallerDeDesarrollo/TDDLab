import React, { useMemo } from 'react';

import { ProcessedTDDLogs } from '../../../modules/TDDCycles-Visualization/domain/ProcessedTDDLogInterfaces';

interface TDDCycleChartProps {
  data: ProcessedTDDLogs | null;
}

const TDDCycleChart: React.FC<TDDCycleChartProps> = ({ data }) => {
  console.log(data);
  const processedData = useMemo(() => {
    return data?.commits || [];
  }, [data]);

  const summary = useMemo(() => {
    return data?.summary || { totalCommits: 0, totalExecutions: 0 };
  }, [data]);

  if (!data) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Ciclo de Ejecución de Pruebas TDD</h2>
        </div>
        <div style={{...styles.summary, justifyContent: 'center'}}>
          <span style={styles.legendText}>Cargando datos...</span>
        </div>
      </div>
    );
  }

  if (processedData.length === 0) {
     return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Ciclo de Ejecución de Pruebas TDD</h2>
        </div>
        <div style={{...styles.summary, justifyContent: 'center'}}>
          <span style={styles.legendText}>No hay datos de ejecución de pruebas para mostrar.</span>
        </div>
      </div>
    );
  }

  const chartHeight = 400;
  const chartWidth = 1200;
  const leftPadding = 60;
  const rightPadding = 60;
  const topPadding = 40;
  const bottomPadding = 80;
  const plotWidth = chartWidth - leftPadding - rightPadding;
  const plotHeight = chartHeight - topPadding - bottomPadding;
  
  const commitSpacing = plotWidth / (processedData.length + 1);
  const iconSize = 36; // Tamaño del icono (aumentado de 30 a 36)
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

        {/* Data points - CHECKS Y X en lugar de círculos */}
        {processedData.map((commit, commitIndex) => {
          const x = leftPadding + (commitIndex + 1) * commitSpacing;
          
          return (
            <g key={`commit-${commitIndex}`}>
              {commit.tests.map((test, testIndex) => {
                const y = topPadding + plotHeight - (testIndex * (iconSize + circleSpacing)) - iconSize/2;
                
                return (
                  <text
                    key={`test-${commitIndex}-${testIndex}`}
                    x={x}
                    y={y}
                    fill={test.passed ? '#28A745' : '#D73A49'}
                    fontSize={iconSize}
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontFamily: 'Arial' }}
                  >
                    {test.passed ? '✔' : '✖'}
                  </text>
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

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <span style={{...styles.legendIcon, color: '#28A745'}}>✔</span>
          <span style={styles.legendText}>Pruebas exitosas</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{...styles.legendIcon, color: '#D73A49'}}>✖</span>
          <span style={styles.legendText}>Pruebas fallidas</span>
        </div>
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryItem}>
          <strong>Total de commits:</strong> {summary.totalCommits}
        </div>
        <div style={styles.summaryItem}>
          <strong>Total de ejecuciones:</strong> {summary.totalExecutions}
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
    gap: '8px',
  },
  legendIcon: {
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  legendText: {
    fontSize: '14px',
    color: '#666',
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