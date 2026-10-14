import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import TDDCycleChart from '../../../src/presentation/tdd-visualization/components/TDDCycleChart';

const CHART_TITLE = 'Ciclo de Ejecución de Pruebas TDD';
const EMPTY_STATE_MESSAGE = 'Este repositorio no tiene ejecución de pruebas registradas.';

describe('TDDCycleChart empty state', () => {
  it('shows the empty state message when there are no logs', () => {
    render(<TDDCycleChart data={[]} />);

    expect(screen.getByRole('heading', { name: CHART_TITLE })).toBeInTheDocument();
    expect(screen.getByTestId('tdd-cycle-chart-empty')).toHaveTextContent(EMPTY_STATE_MESSAGE);
    expect(screen.queryByText('Leyenda')).not.toBeInTheDocument();
  });

  it('shows the empty state message when there are only commit logs', () => {
    const commitLogs = [
      { testId: 1, commitId: 'a1b2c3', commitName: 'feat: add sum function', commitTimestamp: 1700000000000 },
      { testId: 2, commitId: 'd4e5f6', commitName: 'refactor: clean sum function', commitTimestamp: 1700000100000 },
    ];

    render(<TDDCycleChart data={commitLogs} />);

    expect(screen.getByTestId('tdd-cycle-chart-empty')).toHaveTextContent(EMPTY_STATE_MESSAGE);
    expect(screen.queryByText('Leyenda')).not.toBeInTheDocument();
  });

  it('shows the chart and hides the empty state message when there are test executions', () => {
    const testExecutionLogs = [
      { testId: 1, numPassedTests: 2, failedTests: 0, numTotalTests: 2, timestamp: 1700000000000, success: true },
      { testId: 2, numPassedTests: 1, failedTests: 1, numTotalTests: 2, timestamp: 1700000100000, success: false },
    ];

    render(<TDDCycleChart data={testExecutionLogs} />);

    expect(screen.queryByTestId('tdd-cycle-chart-empty')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: CHART_TITLE })).toBeInTheDocument();
    expect(screen.getByText('Leyenda')).toBeInTheDocument();
    expect(screen.getByText('Commit 1')).toBeInTheDocument();
  });
});