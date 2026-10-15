import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TDDCycleChart from '../../../src/presentation/tdd-visualization/components/TDDCycleChart';
import {
  mixedTDDLogs as testData,
  ventasISCommitOnlyLogs,
} from './fixtures/tddLogFixtures';

describe('TDDCycleChart', () => {
  it('explica la ausencia de ejecuciones cuando el log de ventasIS solo contiene commits', () => {
    const { container } = render(<TDDCycleChart data={ventasISCommitOnlyLogs} />);

    expect(
      screen.queryAllByRole('img', { name: /Ejecución (exitosa|con fallos)/ }),
    ).toHaveLength(0);
    expect(
      screen.getByText('No hay ejecuciones de pruebas registradas'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/contiene registros de commits, pero no registros de ejecución/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/script\/tdd_log\.json/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'No hay ejecuciones de pruebas registradas',
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('explica un log vacío sin afirmar que contiene commits', () => {
    const { container } = render(<TDDCycleChart data={[]} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'No hay ejecuciones de pruebas registradas',
    );
    expect(screen.getByText(/no contiene registros para esta gráfica/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/contiene registros de commits, pero no registros de ejecución/i),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/script\/tdd_log\.json/)).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('actualiza el estado vacío cuando cambian los registros recibidos', () => {
    const { rerender } = render(<TDDCycleChart data={ventasISCommitOnlyLogs} />);

    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<TDDCycleChart data={testData} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ejecución exitosa' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ejecución con fallos' })).toBeInTheDocument();

    rerender(<TDDCycleChart data={[]} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.queryAllByRole('img', { name: /Ejecución (exitosa|con fallos)/ }),
    ).toHaveLength(0);
  });

  it('representa una ejecución con todas las pruebas fallidas como una ejecución existente', () => {
    render(
      <TDDCycleChart
        data={[
          {
            numPassedTests: 0,
            failedTests: 3,
            numTotalTests: 3,
            timestamp: 5,
            success: false,
            testId: 4,
          },
        ]}
      />,
    );

    expect(screen.getByRole('img', { name: 'Ejecución con fallos' })).toBeInTheDocument();
    expect(
      screen.queryByText('No hay ejecuciones de pruebas registradas'),
    ).not.toBeInTheDocument();
  });

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
