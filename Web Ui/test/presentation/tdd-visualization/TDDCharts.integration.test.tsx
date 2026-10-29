import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import TDDCharts from '../../../src/presentation/tdd-visualization/components/TDDChart';
import type { CommitDataObject } from '../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces';
import type { TDDLogEntry } from '../../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces';
import { MockGithubAPI } from './__mocks__/MocksCommitHistory';
import { mixedTDDLogs, ventasISCommitOnlyLogs } from './fixtures/tddLogFixtures';

// Se conserva el flujo real selector -> TDDLineCharts -> dashboard/ciclo.
// Se simula el dibujo de la biblioteca externa para no depender de canvas.
jest.mock('react-chartjs-2', () => {
  const { forwardRef } = jest.requireActual<typeof import('react')>('react');
  const ChartStub = forwardRef<HTMLDivElement, { data: unknown }>(({ data }, ref) => (
    <div ref={ref} data-testid="commit-metric-chart">{JSON.stringify(data)}</div>
  ));
  ChartStub.displayName = 'ChartStub';
  return { Bubble: ChartStub, Line: ChartStub, getElementAtEvent: jest.fn(() => []) };
});

// No se navega a la lista en estos casos. Se evita cargar sus iconos y detalles.
jest.mock('../../../src/presentation/tdd-visualization/components/TDDList', () => ({
  __esModule: true,
  default: () => null,
}));

const commits: CommitDataObject[] = [{
  html_url: 'https://github.com/example/repo/commit/commit-1',
  sha: 'commit-1',
  stats: { total: 2, additions: 2, deletions: 0 },
  commit: {
    date: new Date('2026-01-01T00:00:00Z'),
    message: 'feat: calcular total',
    url: 'https://api.github.com/repos/example/repo/git/commits/commit-1',
    comment_count: 0,
  },
  coverage: 91,
  test_count: 3,
  conclusion: 'success',
}];

function renderCharts(tddLogs: TDDLogEntry[] | null) {
  const setMetric = jest.fn();
  const props = {
    commits, tddLogs, metric: null, setMetric, port: new MockGithubAPI(),
    role: 'student', commitsTddCycles: null, typegraphs: 'graph',
  };
  return { ...render(<TDDCharts {...props} />), props, setMetric };
}

function openMetricMenu() {
  fireEvent.mouseDown(screen.getByRole('combobox'));
  return within(screen.getByRole('listbox'));
}

describe('Integración de la visualización TDD', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  const logsWithoutExecutions: Array<{ name: string; logs: TDDLogEntry[] | null }> = [
    { name: 'log no disponible', logs: null },
    { name: 'log vacío', logs: [] },
    { name: 'solo commits de ventasIS', logs: ventasISCommitOnlyLogs },
  ];

  it.each(logsWithoutExecutions)(
    'conserva métricas y permite abrir el ciclo con $name',
    ({ logs }) => {
      const { setMetric } = renderCharts(logs);

      expect(screen.getByRole('status')).toHaveTextContent(/^No se tiene ejecución de pruebas$/);
      expect(screen.getByRole('status')).not.toHaveTextContent(/\blog\b|tdd_log\.json|script\//i);
      expect(screen.getByRole('heading', { name: 'Métricas de Commits con Cobertura de Código' })).toBeInTheDocument();
      const metricCharts = screen.getAllByTestId('commit-metric-chart');
      expect(metricCharts).toHaveLength(4);
      expect(metricCharts.some(chart => chart.textContent?.includes('"data":[91]'))).toBe(true);
      expect(metricCharts.some(chart => chart.textContent?.includes('"data":[3]'))).toBe(true);

      const menu = openMetricMenu();
      expect(menu.getByRole('option', { name: 'Dashboard' })).toBeInTheDocument();
      fireEvent.click(menu.getByRole('option', { name: 'Ciclo de ejecución de pruebas' }));

      expect(screen.getByRole('status')).toHaveTextContent(/^No se tiene ejecución de pruebas$/);
      expect(screen.queryAllByTestId('commit-metric-chart')).toHaveLength(0);
      expect(setMetric).toHaveBeenCalledWith('Ciclo de ejecución de pruebas');
      expect(localStorage.getItem('selectedMetric')).toBe('Ciclo de ejecución de pruebas');

      fireEvent.click(openMetricMenu().getByRole('option', { name: 'Dashboard' }));
      expect(screen.getAllByTestId('commit-metric-chart')).toHaveLength(4);
      expect(screen.getByRole('status')).toBeInTheDocument();
    },
  );

  it.each(logsWithoutExecutions)(
    'restaura la vista del ciclo guardada con $name',
    ({ logs }) => {
      localStorage.setItem('selectedMetric', 'Ciclo de ejecución de pruebas');
      renderCharts(logs);

      expect(screen.getByRole('combobox')).toHaveTextContent('Ciclo de ejecución de pruebas');
      expect(screen.getByRole('status')).toHaveTextContent(/^No se tiene ejecución de pruebas$/);
      expect(screen.getByRole('status')).not.toHaveTextContent(/\blog\b|tdd_log\.json|script\//i);
      expect(screen.queryAllByRole('img', { name: /Ejecución (exitosa|con fallos)/ })).toHaveLength(0);
      const menu = openMetricMenu();
      expect(menu.getByRole('option', { name: 'Dashboard' })).toBeInTheDocument();
      expect(menu.getByRole('option', { name: 'Ciclo de ejecución de pruebas', selected: true })).toBeInTheDocument();
    },
  );

  it('conserva las ejecuciones reales al cambiar entre dashboard, ciclo y cobertura', () => {
    renderCharts(mixedTDDLogs);

    expect(screen.getByRole('img', { name: 'Ejecución exitosa' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ejecución con fallos' })).toBeInTheDocument();

    fireEvent.click(openMetricMenu().getByRole('option', { name: 'Ciclo de ejecución de pruebas' }));
    expect(screen.getByRole('img', { name: 'Ejecución exitosa' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ejecución con fallos' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    fireEvent.click(openMetricMenu().getByRole('option', { name: 'Porcentaje de Cobertura de Código' }));
    expect(screen.getByTestId('commit-metric-chart')).toHaveTextContent('"data":[91]');
    expect(screen.queryByRole('heading', { name: 'Ciclo de Ejecución de Pruebas TDD' })).not.toBeInTheDocument();
  });

  it('actualiza la vista del ciclo al recibir logs de otro repositorio', () => {
    localStorage.setItem('selectedMetric', 'Ciclo de ejecución de pruebas');
    const { rerender, props } = renderCharts(mixedTDDLogs);
    expect(screen.getAllByRole('img', { name: /Ejecución (exitosa|con fallos)/ })).toHaveLength(2);

    rerender(<TDDCharts {...props} tddLogs={ventasISCommitOnlyLogs} />);
    expect(screen.getByRole('status')).toHaveTextContent(/^No se tiene ejecución de pruebas$/);
    expect(screen.queryAllByRole('img', { name: /Ejecución (exitosa|con fallos)/ })).toHaveLength(0);

    rerender(<TDDCharts {...props} tddLogs={null} />);
    expect(screen.getByRole('status')).toHaveTextContent(/^No se tiene ejecución de pruebas$/);
    expect(screen.getByRole('combobox')).toHaveTextContent('Ciclo de ejecución de pruebas');
  });
});
