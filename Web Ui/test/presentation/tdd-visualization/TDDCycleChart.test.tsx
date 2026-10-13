import { fireEvent, render, screen } from '@testing-library/react';
import TDDCycleChart from '../../../src/presentation/tdd-visualization/components/TDDCycleChart';

const testData = [
  {
    commitId: 'commit-1',
    commitName: 'Primer commit',
    commitTimestamp: 1,
    testId: 1,
  },
  {
    numPassedTests: 3,
    failedTests: 0,
    numTotalTests: 3,
    timestamp: 2,
    success: true,
    testId: 2,
  },
  {
    commitId: 'commit-2',
    commitName: 'Segundo commit',
    commitTimestamp: 3,
    testId: 3,
  },
  {
    numPassedTests: 2,
    failedTests: 1,
    numTotalTests: 3,
    timestamp: 4,
    success: false,
    testId: 4,
  },
];

describe('TDDCycleChart', () => {
  it('muestra el símbolo accesible según el resultado de cada ejecución', () => {
    render(<TDDCycleChart data={testData} />);

    expect(screen.getByRole('img', { name: 'Ejecución exitosa' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Ejecución con fallos' })).toBeTruthy();

    const successfulSymbol = screen.getByRole('img', { name: 'Ejecución exitosa' });
    const failedSymbol = screen.getByRole('img', { name: 'Ejecución con fallos' });
    expect(successfulSymbol.querySelector('path')).toBeTruthy();
    expect(failedSymbol.querySelector('path')).toBeTruthy();
    expect(successfulSymbol.querySelector('path')?.getAttribute('stroke-linecap')).toBe('round');
    expect(failedSymbol.querySelector('path')?.getAttribute('stroke-linecap')).toBe('round');
  });

  it('muestra una leyenda con el significado de cada símbolo', () => {
    render(<TDDCycleChart data={testData} />);

    expect(screen.getByRole('region', { name: 'Leyenda de resultados de ejecución' })).toBeTruthy();
    expect(screen.getByText('Ejecución exitosa')).toBeTruthy();
    expect(screen.getByText('Ejecución con fallos')).toBeTruthy();
  });

  it('conserva el detalle de ejecución en el tooltip del símbolo', () => {
    render(<TDDCycleChart data={testData} />);

    const successfulExecution = screen.getByRole('img', { name: 'Ejecución exitosa' });
    fireEvent.mouseEnter(successfulExecution);

    expect(screen.getByRole('tooltip').textContent).toContain(
      'Ejecución exitosa: 3 pruebas exitosas, 0 fallidas de 3.',
    );

    const tooltips = Array.from(document.querySelectorAll('title')).map((title) => title.textContent);

    expect(tooltips).toContain('Ejecución exitosa: 3 pruebas exitosas, 0 fallidas de 3.');
    expect(tooltips).toContain('Ejecución con fallos: 2 pruebas exitosas, 1 fallidas de 3.');
  });
});


describe('TDDCycleChart sin ejecuciones registradas', () => {
  it('explica un registro que solo contiene commits, como ventasIS', () => {
    const { container } = render(<TDDCycleChart data={testData.filter(log => 'commitId' in log)} />);

    expect(screen.getByRole('status').textContent).toContain('No hay ejecuciones de pruebas registradas');
    expect(screen.getByRole('status').textContent).toContain('El registro contiene commits');
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryByRole('region', { name: 'Leyenda de resultados de ejecución' })).toBeNull();
  });

  it('explica un registro vacío sin afirmar que contiene commits', () => {
    const { container } = render(<TDDCycleChart data={[]} />);

    expect(screen.getByRole('status').textContent).toContain('No hay ejecuciones de pruebas registradas');
    expect(screen.getByRole('status').textContent).not.toContain('El registro contiene commits');
    expect(container.querySelector('svg')).toBeNull();
  });

  it('muestra una ejecución con cero pruebas aprobadas cuando llegan resultados', () => {
    const { rerender } = render(<TDDCycleChart data={[]} />);
    rerender(<TDDCycleChart data={[{
      numPassedTests: 0, failedTests: 3, numTotalTests: 3,
      timestamp: 5, success: false, testId: 5,
    }]} />);

    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('img', { name: 'Ejecución con fallos' })).toBeTruthy();
  });
});
