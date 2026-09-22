import React, { useMemo } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CommitIcon from '@mui/icons-material/Commit';
import ScienceIcon from '@mui/icons-material/Science';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import '../styles/TDDCycleChart.css';

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
  commitName?: string;
  tests: Array<{ passed: boolean; size: number }>;
}

const TDDCycleChart: React.FC<TDDCycleChartProps> = ({ data = [] }) => {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    const commitMap = new Map<number, CommitData>();
    let currentCommit = 0;

    for (const log of data){
      if (log.commitId) {
        currentCommit += 1;
        commitMap.set(currentCommit, {
          commitNumber: currentCommit,
          commitName: log.commitName,
          tests: [],
        });
      }
      
      if (log.numPassedTests !== undefined) {
        if (currentCommit === 0) currentCommit = 1;
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

  const totalTests = processedData.reduce((total, commit) => total + commit.tests.length, 0);
  const passedTests = processedData.reduce(
    (total, commit) => total + commit.tests.filter((test) => test.passed).length,
    0,
  );
  const failedTests = totalTests - passedTests;
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  const maxTests = Math.max(7, ...processedData.map((commit) => commit.tests.length));
  const chartHeight = 390;
  const chartWidth = 1200;
  const leftPadding = 76;
  const rightPadding = 34;
  const topPadding = 28;
  const bottomPadding = 68;
  const plotWidth = chartWidth - leftPadding - rightPadding;
  const plotHeight = chartHeight - topPadding - bottomPadding;
  
  const commitSpacing = plotWidth / (processedData.length + 1);
  const circleRadius = 10;
  const circleSpacing = 5;

  return (
    <section className="tdd-cycle-dashboard" aria-labelledby="tdd-cycle-title">
      <div className="tdd-cycle-heading">
        <div>
          <p className="tdd-cycle-eyebrow">ANÁLISIS DEL REPOSITORIO</p>
          <h2 id="tdd-cycle-title">Ciclo de ejecución de pruebas TDD</h2>
          <p className="tdd-cycle-description">Seguimiento de cada ejecución por commit para identificar la evolución de la suite.</p>
        </div>
        <div className="tdd-cycle-status-badge"><span className="tdd-cycle-status-dot" />Datos actualizados</div>
      </div>

      <div className="tdd-cycle-summary" aria-label="Resumen de pruebas">
        <div className="tdd-cycle-summary-card"><span className="tdd-cycle-summary-icon is-blue"><ScienceIcon /></span><div><span>Total de pruebas</span><strong>{totalTests}</strong><small>Evaluadas en el ciclo</small></div></div>
        <div className="tdd-cycle-summary-card"><span className="tdd-cycle-summary-icon is-green"><CheckCircleIcon /></span><div><span>Pruebas exitosas</span><strong>{passedTests}</strong><small>Pasaron correctamente</small></div></div>
        <div className="tdd-cycle-summary-card"><span className="tdd-cycle-summary-icon is-red"><CancelIcon /></span><div><span>Pruebas fallidas</span><strong>{failedTests}</strong><small>Requieren atención</small></div></div>
        <div className="tdd-cycle-summary-card"><span className="tdd-cycle-summary-icon is-amber"><TrendingUpIcon /></span><div><span>Tasa de éxito</span><strong>{successRate}%</strong><small>Rendimiento general</small></div></div>
      </div>

      <div className="tdd-cycle-chart-card">
        <div className="tdd-cycle-chart-card-header"><div><h3>Gráfica de dispersión TDD</h3><p>Cada punto representa una ejecución de pruebas asociada a un commit.</p></div><div className="tdd-cycle-legend"><span><CheckCircleIcon className="is-green" /> Prueba exitosa</span><span><CancelIcon className="is-red" /> Prueba fallida</span></div></div>
        <div className="tdd-cycle-chart-scroll">
        <svg className="tdd-cycle-svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Evolución de pruebas por commit">
        {[...Array(maxTests + 1)].map((_, i) => (
          <line
            key={`grid-${i}`}
            x1={leftPadding}
            y1={topPadding + (plotHeight / maxTests) * i}
            x2={leftPadding + plotWidth}
            y2={topPadding + (plotHeight / maxTests) * i}
            className="tdd-cycle-grid-line"
          />
        ))}

        {/* Y-axis */}
        <line
          x1={leftPadding}
          y1={topPadding}
          x2={leftPadding}
          y2={topPadding + plotHeight}
          className="tdd-cycle-axis"
        />

        {/* X-axis */}
        <line
          x1={leftPadding}
          y1={topPadding + plotHeight}
          x2={leftPadding + plotWidth}
          y2={topPadding + plotHeight}
          className="tdd-cycle-axis"
        />

        {/* Y-axis label */}
        <text
          x={20}
          y={topPadding + plotHeight / 2}
          className="tdd-cycle-axis-title"
          textAnchor="middle"
          transform={`rotate(-90, 20, ${topPadding + plotHeight / 2})`}
        >
          Pruebas ejecutadas
        </text>

        {/* Y-axis ticks */}
        {[...Array(maxTests + 1)].map((_, i) => (
          <text
            key={`y-tick-${i}`}
            x={leftPadding - 10}
            y={topPadding + plotHeight - (plotHeight / maxTests) * i + 4}
            className="tdd-cycle-axis-label"
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
                const y = topPadding + plotHeight - (testIndex * (circleRadius * 2 + circleSpacing)) - circleRadius;
                
                return (
                  <g key={`test-${commitIndex}-${testIndex}`}>
                    <circle cx={x} cy={y} r={circleRadius + 3} className="tdd-cycle-point-halo" />
                    {test.passed ? <CheckCircleIcon x={x - circleRadius} y={y - circleRadius} width={circleRadius * 2} height={circleRadius * 2} className="tdd-cycle-point is-green" /> : <CancelIcon x={x - circleRadius} y={y - circleRadius} width={circleRadius * 2} height={circleRadius * 2} className="tdd-cycle-point is-red" />}
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
            className="tdd-cycle-commit-label"
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
          className="tdd-cycle-axis-title"
          textAnchor="middle"
        >
          Commits
        </text>
        </svg></div>
        <div className="tdd-cycle-chart-footer"><span><CommitIcon /> {processedData.length} commits analizados</span><span>{totalTests} ejecuciones registradas</span></div>
      </div>
    </section>
  );
};

export default TDDCycleChart;