import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import TDDCharts from '../../../src/presentation/tdd-visualization/components/TDDChart';
import type { CommitDataObject } from '../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces';
import type { TDDLogEntry } from '../../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces';
import { MockGithubAPI } from './__mocks__/MocksCommitHistory';
import { dashboardTDDLogs, ventasISCommitOnlyLogs } from './fixtures/tddLogFixtures';

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

// Las gráficas restauradas se aíslan: sus propios tests cubren su render.
jest.mock('../../../src/presentation/tdd-visualization/components/TDDBoard', () => ({
  __esModule: true,
  default: () => <div data-testid="tdd-board" />,
}));

jest.mock('../../../src/presentation/tdd-visualization/components/TDDCycleChart', () => ({
  __esModule: true,
  default: () => <div data-testid="tdd-cycle-chart" />,
}));

function makeCommit(
  sha: string,
  branch: string,
  coverage: number,
): CommitDataObject {
  return {
    html_url: `https://github.com/example/repo/commit/${sha}`,
    sha,
    branch,
    stats: { total: 2, additions: 2, deletions: 0 },
    commit: {
      date: new Date('2026-01-01T00:00:00Z'),
      message: `commit ${sha}`,
      url: `https://api.github.com/repos/example/repo/git/commits/${sha}`,
      comment_count: 0,
    },
    coverage,
    test_count: 3,
    conclusion: 'success',
  } as CommitDataObject;
}

const commits: CommitDataObject[] = [
  makeCommit('sha-main-1', 'main', 91),
  makeCommit('sha-main-2', 'main', 91),
  makeCommit('sha-login', 'feature/login', 84),
];

function renderCharts(tddLogs: TDDLogEntry[] | null) {
  const setMetric = jest.fn();
  const props = {
    commits, tddLogs, metric: null, setMetric, port: new MockGithubAPI(),
    role: 'student', commitsTddCycles: null, typegraphs: 'graph',
  };
  return { ...render(<TDDCharts {...props} />), props, setMetric };
}

function openMetricMenu() {
  const metricSelect = within(screen.getByTestId('select-graph-type')).getByRole('combobox');
  fireEvent.mouseDown(metricSelect);
  return within(screen.getByRole('listbox'));
}

function selectMetric(name: string) {
  fireEvent.click(openMetricMenu().getByRole('option', { name }));
}

function expectDashboardShell() {
  expect(screen.getByRole('heading', { name: 'Ramas del repositorio' })).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Ciclo de ejecución de pruebas TDD' }),
  ).toBeInTheDocument();
  expect(screen.getByTestId('tdd-selected-branch')).toHaveTextContent('main');
}

describe('Integración de la visualización TDD', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('muestra el dashboard clásico por defecto y conserva todas las opciones', () => {
    renderCharts(dashboardTDDLogs);

    expect(screen.getByTestId('tdd-board')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveTextContent('Dashboard clásico');

    const menu = openMetricMenu();
    expect(menu.getByRole('option', { name: 'Dashboard clásico', selected: true })).toBeInTheDocument();
    expect(menu.getByRole('option', { name: 'Ciclo de ejecución de pruebas' })).toBeInTheDocument();
    expect(menu.getByRole('option', { name: 'Dashboard' })).toBeInTheDocument();
    expect(menu.getByRole('option', { name: 'Total Número de Tests' })).toBeInTheDocument();
    expect(menu.getByRole('option', { name: 'Porcentaje de Cobertura de Código' })).toBeInTheDocument();
    expect(menu.getByRole('option', { name: 'Líneas de Código Modificadas' })).toBeInTheDocument();
    expect(menu.getByRole('option', { name: 'Lista de Commits' })).toBeInTheDocument();

    fireEvent.click(menu.getByRole('option', { name: 'Dashboard' }));
    expectDashboardShell();
    expect(screen.queryByTestId('tdd-board')).not.toBeInTheDocument();
  });

  const logsWithoutExecutions: Array<{ name: string; logs: TDDLogEntry[] | null }> = [
    { name: 'log no disponible', logs: null },
    { name: 'log vacío', logs: [] },
    { name: 'solo commits de ventasIS', logs: ventasISCommitOnlyLogs },
  ];

  it.each(logsWithoutExecutions)(
    'muestra el dashboard sin ejecuciones y conserva las métricas con $name',
    ({ logs }) => {
      const { setMetric } = renderCharts(logs);
      expect(screen.getByTestId('tdd-board')).toBeInTheDocument();

      selectMetric('Dashboard');
      expectDashboardShell();
      expect(screen.getAllByRole('button', { name: /feature\/login/ })[0]).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(/^No se tiene ejecución de pruebas$/);
      expect(screen.getByRole('status')).not.toHaveTextContent(/\blog\b|tdd_log\.json|script\//i);
      expect(screen.queryAllByTestId('commit-metric-chart')).toHaveLength(0);
      expect(screen.queryAllByRole('img', { name: /^Ejecución (exitosa|con fallos):/ })).toHaveLength(0);

      selectMetric('Porcentaje de Cobertura de Código');
      expect(setMetric).toHaveBeenCalledWith('Cobertura de Código');
      expect(localStorage.getItem('selectedMetric')).toBe('Cobertura de Código');
      expect(screen.getByTestId('commit-metric-chart')).toHaveTextContent(
        '"label":"Porcentaje de Cobertura de Código"',
      );

      selectMetric('Dashboard');
      expectDashboardShell();
      expect(screen.getByRole('status')).toBeInTheDocument();
    },
  );

  it('muestra TDDCycleChart al elegir la métrica de ciclo', () => {
    renderCharts(dashboardTDDLogs);

    selectMetric('Ciclo de ejecución de pruebas');

    expect(screen.getByTestId('tdd-cycle-chart')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ciclo de ejecución de pruebas TDD' })).not.toBeInTheDocument();
    expect(localStorage.getItem('selectedMetric')).toBe('Ciclo de ejecución de pruebas');
  });

  it.each(logsWithoutExecutions)(
    'conserva la métrica de ciclo guardada con $name',
    ({ logs }) => {
      localStorage.setItem('selectedMetric', 'Ciclo de ejecución de pruebas');
      renderCharts(logs);

      expect(screen.getByTestId('tdd-cycle-chart')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveTextContent('Ciclo de ejecución de pruebas');
      expect(
        openMetricMenu().getByRole('option', { name: 'Ciclo de ejecución de pruebas', selected: true }),
      ).toBeInTheDocument();
    },
  );

  it('muestra ejecuciones agrupadas por commit y cambia de rama desde la lista', () => {
    renderCharts(dashboardTDDLogs);
    selectMetric('Dashboard');

    expectDashboardShell();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /^Ejecución (exitosa|con fallos):/ })).toHaveLength(4);
    expect(screen.getByTestId('tdd-summary-commits')).toHaveTextContent('2');
    expect(screen.getByTestId('tdd-summary-executions')).toHaveTextContent('4');
    expect(screen.getByTestId('tdd-summary-passed')).toHaveTextContent('2');
    expect(screen.getByTestId('tdd-summary-failed')).toHaveTextContent('2');

    fireEvent.click(screen.getAllByRole('button', { name: /feature\/login/ })[0]);
    expect(screen.getByTestId('tdd-selected-branch')).toHaveTextContent('feature/login');
    expect(screen.getAllByRole('img', { name: /^Ejecución (exitosa|con fallos):/ })).toHaveLength(1);
    expect(screen.getByTestId('tdd-summary-executions')).toHaveTextContent('1');

    fireEvent.click(screen.getAllByRole('button', { name: /main/ })[0]);
    expect(screen.getByTestId('tdd-selected-branch')).toHaveTextContent('main');
    expect(screen.getByTestId('tdd-summary-executions')).toHaveTextContent('4');
  });

  it('actualiza el dashboard al recibir logs de otro repositorio', () => {
    const { rerender, props } = renderCharts(dashboardTDDLogs);
    selectMetric('Dashboard');
    expect(screen.getAllByRole('img', { name: /^Ejecución (exitosa|con fallos):/ })).toHaveLength(4);

    rerender(<TDDCharts {...props} tddLogs={ventasISCommitOnlyLogs} />);
    expect(screen.getByRole('status')).toHaveTextContent(/^No se tiene ejecución de pruebas$/);
    expect(screen.queryAllByRole('img', { name: /^Ejecución (exitosa|con fallos):/ })).toHaveLength(0);

    rerender(<TDDCharts {...props} tddLogs={null} />);
    expect(screen.getByRole('status')).toHaveTextContent(/^No se tiene ejecución de pruebas$/);
    expect(screen.getByRole('combobox')).toHaveTextContent('Dashboard');
  });

  it('no muta los commits originales al limitar líneas para las métricas', () => {
    const largeCommit = makeCommit('sha-large', 'main', 91);
    largeCommit.stats.total = 250;
    const largeCommits = [largeCommit];
    const setMetric = jest.fn();

    render(
      <TDDCharts
        commits={largeCommits}
        tddLogs={null}
        metric={null}
        setMetric={setMetric}
        port={new MockGithubAPI()}
        role="student"
        commitsTddCycles={null}
        typegraphs="graph"
      />,
    );

    expect(largeCommit.stats.total).toBe(250);
    selectMetric('Dashboard');
    expectDashboardShell();
  });
});
