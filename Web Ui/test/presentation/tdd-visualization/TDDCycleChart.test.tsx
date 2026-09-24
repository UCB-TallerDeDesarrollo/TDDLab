import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TDDCycleChart from '../../../src/presentation/tdd-visualization/components/TDDCycleChart';

describe('TDDCycleChart', () => {
  it('muestra ejecuciones exitosas, fallidas y de refactor con símbolos distintos', () => {
    const { container } = render(
      <TDDCycleChart
        data={[
          { testId: 1, numPassedTests: 2, failedTests: 0, numTotalTests: 2, success: true },
          { testId: 1, commitId: 'one', commitName: 'feat: primera función' },
          { testId: 2, numPassedTests: 1, failedTests: 1, numTotalTests: 2, success: false },
          { testId: 2, commitId: 'two', commitName: 'refactor: ordenar servicio' },
          { testId: 3, numPassedTests: 3, failedTests: 0, numTotalTests: 3, success: true },
          { testId: 3, commitId: 'three', commitName: 'refactor: extraer método' },
        ]}
      />
    );

    expect(container.querySelectorAll('[data-status="success"]')).toHaveLength(1);
    expect(container.querySelectorAll('polygon[data-status="failed"]')).toHaveLength(1);
    expect(container.querySelectorAll('circle[data-status="refactor"]')).toHaveLength(1);
    expect(screen.getByLabelText('Commit 3: Refactor')).toHaveAttribute('stroke', '#0B4F8A');
  });

  it('considera fallida una ejecución sin pruebas', () => {
    const { container } = render(
      <TDDCycleChart
        data={[
          { testId: 1, numPassedTests: 0, failedTests: 0, numTotalTests: 0, success: true },
          { testId: 1, commitId: 'zero', commitName: 'test: ejecución vacía' },
        ]}
      />
    );

    expect(container.querySelector('polygon[data-status="failed"]')).toBeInTheDocument();
  });
});
