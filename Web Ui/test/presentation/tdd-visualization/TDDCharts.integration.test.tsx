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

// La lista tiene sus propias pruebas. Aquí comprobamos la navegación entre métricas.
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
      expect(screen.queryByRole('button', { name: 'Ver bifurcaciones' })).toBeNull();
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

  it('uses the history number on the Dashboard when a preceding commit has no metrics', () => {
    renderCharts([{
      commitId: 'commit-1', commitName: 'Cálculo', commitTimestamp: 2, testId: 0,
      gitGraph: [
        { sha: 'commit-1', parents: ['root'], subject: 'Cálculo' },
        { sha: 'root', parents: [], subject: 'Inicio' },
      ],
    }]);

    const [dashboard] = screen.getAllByTestId('commit-metric-chart');
    const { datasets } = JSON.parse(dashboard.textContent ?? '{}');
    expect(datasets).toHaveLength(1);
    expect(datasets[0]).toMatchObject({ label: 'Commit 2', data: [{ x: 2, y: 3 }] });
  });

  it('abre las bifurcaciones y permite regresar mediante el selector de métricas', () => {
    localStorage.setItem('selectedMetric', 'Ciclo de ejecución de pruebas');
    renderCharts([
      ...mixedTDDLogs,
      {
        commitId: 'commit-3',
        commitName: 'Integración',
        commitTimestamp: 5,
        testId: 5,
        gitGraph: [{ sha: 'commit-3', parents: ['commit-1', 'commit-2'], subject: 'Integración' }],
      },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Ver bifurcaciones' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('Lista de Commits');

    expect(screen.queryByRole('button', { name: 'Volver al ciclo de pruebas' })).toBeNull();
    fireEvent.click(openMetricMenu().getByRole('option', { name: 'Ciclo de ejecución de pruebas' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('Ciclo de ejecución de pruebas');
    expect(screen.getByRole('img', { name: 'Ejecución con fallos' })).toBeInTheDocument();
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

  it('arranca con 1 rama por defecto, previsualiza al pasar el cursor en el dropdown y mantiene el foco al navegar', () => {
    const multiBranchCommits: CommitDataObject[] = [
      {
        ...commits[0],
        sha: 'commit-main',
        coverage: 91,
        test_count: 3,
        conclusion: 'success',
        commit: { ...commits[0].commit, message: 'feat: base' },
      },
      {
        ...commits[0],
        sha: 'commit-desc',
        coverage: 82,
        test_count: 2,
        conclusion: 'success',
        commit: { ...commits[0].commit, message: 'feat: descuento' },
      },
      {
        ...commits[0],
        sha: 'commit-red',
        coverage: null,
        test_count: 1,
        conclusion: 'failure',
        commit: { ...commits[0].commit, message: 'test: redondeo fallido' },
      },
    ];

    render(
      <TDDCharts
        commits={multiBranchCommits}
        tddLogs={[
          { numPassedTests: 0, failedTests: 1, numTotalTests: 1, timestamp: 1, success: false, testId: 10 },
          { commitId: 'commit-red', commitName: 'test: redondeo fallido', commitTimestamp: 2, testId: 10 },
          { numPassedTests: 2, failedTests: 0, numTotalTests: 2, timestamp: 3, success: true, testId: 11 },
          { commitId: 'commit-desc', commitName: 'feat: descuento', commitTimestamp: 4, testId: 11 },
          {
            commitId: 'commit-main',
            commitName: 'feat: base',
            commitTimestamp: 5,
            testId: 12,
            gitGraph: [
              { sha: 'merge', parents: ['commit-desc', 'commit-red'], subject: 'merge: integrar', historyBranch: 'main' },
              { sha: 'commit-desc', parents: ['commit-main'], subject: 'feat: descuento', recordedBranches: ['feature/descuentos'] },
              { sha: 'commit-red', parents: ['commit-main'], subject: 'test: redondeo fallido', recordedBranches: ['feature/redondeo'] },
              { sha: 'commit-main', parents: ['root'], subject: 'feat: base', historyBranch: 'main' },
              { sha: 'root', parents: [], subject: 'chore: init', historyBranch: 'main' },
            ],
          },
        ]}
        metric={null}
        setMetric={jest.fn()}
        port={new MockGithubAPI()}
        role="student"
        commitsTddCycles={null}
        typegraphs="graph"
      />,
    );

    // Leyenda limpia: Exitoso, Fallido, sin Refactor redundante.
    const bubbleLegend = screen.getByLabelText('Leyenda de colores de commits');
    expect(within(bubbleLegend).getByText('Exitoso')).toBeInTheDocument();
    expect(within(bubbleLegend).getByText('Fallido')).toBeInTheDocument();
    expect(within(bubbleLegend).queryByText('Refactor')).not.toBeInTheDocument();

    const branchRegion = screen.getByRole('region', { name: 'Control de ramas' });
    const trigger = within(branchRegion).getByRole('button', { name: 'Seleccionar ramas' });
    expect(trigger).toHaveTextContent('main');

    const getBubbleDatasets = () =>
      JSON.parse(screen.getAllByTestId('commit-metric-chart')[0].textContent ?? '{}').datasets;

    // Arranca con 1 rama por defecto (main) activa y las demás atenuadas.
    let datasets = getBubbleDatasets();
    expect(datasets).toHaveLength(3);
    expect(datasets.find((d: any) => d.label === 'Commit 2').backgroundColor).toContain('rgba(0, 110, 0');
    expect(datasets.find((d: any) => d.label === 'Commit 2').borderWidth).toBe(3);
    expect(datasets.find((d: any) => d.label === 'Commit 3').backgroundColor).toBe('rgba(148, 163, 184, 0.28)');
    expect(datasets.find((d: any) => d.label === 'Commit 4').backgroundColor).toBe('rgba(148, 163, 184, 0.28)');

    // El riel de topología muestra commits estructurales (root y merge) sin inventar puntos en la burbuja.
    const rail = screen.getByRole('region', { name: 'Recorrido de ramas y merges' });
    expect(rail.querySelector('[data-rail-commit="root"]')).toHaveAttribute('data-rail-active', 'true');
    expect(rail.querySelector('[data-rail-commit="merge"]')).toHaveAttribute('data-rail-active', 'true');
    expect(rail.querySelector('[data-rail-commit="commit-desc"]')).toHaveAttribute('data-rail-active', 'false');
    expect(document.querySelector('[data-cycle-commit="commit-desc"]')).toHaveAttribute('data-cycle-active', 'false');

    // Abrir dropdown y probar vista previa en vivo al pasar el cursor.
    fireEvent.click(trigger);
    const menu = within(branchRegion).getByRole('menu', { name: 'Ramas disponibles' });
    const allItem = within(menu).getByRole('menuitemcheckbox', { name: /Todas las ramas/ });
    const mainItem = within(menu).getByRole('menuitemcheckbox', { name: 'Rama main' });
    const descItem = within(menu).getByRole('menuitemcheckbox', { name: 'Rama feature/descuentos' });
    const redItem = within(menu).getByRole('menuitemcheckbox', { name: 'Rama feature/redondeo' });

    expect(mainItem).toHaveAttribute('aria-checked', 'true');
    expect(descItem).toHaveAttribute('aria-checked', 'false');

    fireEvent.mouseEnter(descItem);
    expect(screen.getByText(/Vista previa:/)).toHaveTextContent('feature/descuentos');
    expect(document.querySelector('[data-cycle-commit="commit-desc"]')).toHaveAttribute('data-cycle-active', 'true');
    expect(rail.querySelector('[data-rail-commit="root"]')).toHaveAttribute('data-rail-active', 'false');

    // Al salir del menú sin hacer clic, vuelve a la selección fijada (main).
    fireEvent.mouseLeave(menu);
    expect(screen.queryByText(/Vista previa:/)).not.toBeInTheDocument();
    expect(document.querySelector('[data-cycle-commit="commit-desc"]')).toHaveAttribute('data-cycle-active', 'false');
    expect(rail.querySelector('[data-rail-commit="root"]')).toHaveAttribute('data-rail-active', 'true');

    // Clic en feature/descuentos suma esa rama sin apagar main.
    fireEvent.click(descItem);
    expect(mainItem).toHaveAttribute('aria-checked', 'true');
    expect(descItem).toHaveAttribute('aria-checked', 'true');
    expect(redItem).toHaveAttribute('aria-checked', 'false');
    expect(document.querySelector('[data-cycle-commit="commit-desc"]')).toHaveAttribute('data-cycle-active', 'true');

    // Clic en Todas las ramas activa todas y conserva coverage: null como null en la mini gráfica de cobertura.
    fireEvent.click(allItem);
    expect(allItem).toHaveAttribute('aria-checked', 'true');
    datasets = getBubbleDatasets();
    expect(datasets.every((d: any) => d.backgroundColor !== 'rgba(148, 163, 184, 0.28)')).toBe(true);
    const failedDataset = datasets.find((d: any) => d.data[0].y === 1);
    expect(failedDataset.backgroundColor).toBe('red');

    const coverageMiniChart = JSON.parse(screen.getAllByTestId('commit-metric-chart')[2].textContent ?? '{}');
    expect(coverageMiniChart.datasets[0].data).toContain(null);

    // Desde Todas, clic en feature/redondeo aísla esa rama y se preserva al abrir la gráfica de cobertura sin reload.
    fireEvent.click(redItem);
    expect(redItem).toHaveAttribute('aria-checked', 'true');
    expect(mainItem).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Abrir gráfica de Cobertura de Código' }));
    const singleCoverage = JSON.parse(screen.getByTestId('commit-metric-chart').textContent ?? '{}');
    expect(singleCoverage.datasets[0].data).toContain(null);
    expect(screen.getByRole('button', { name: 'Seleccionar ramas' })).toHaveTextContent('feature/redondeo');
  });

  it('elige la rama más reciente por defecto cuando el repositorio no tiene main', () => {
    render(
      <TDDCharts
        commits={[
          { ...commits[0], sha: 'c-a' },
          { ...commits[0], sha: 'c-b' },
        ]}
        tddLogs={[
          {
            commitId: 'c-b',
            commitName: 'feat: pago',
            commitTimestamp: 2,
            testId: 1,
            gitGraph: [
              { sha: 'c-b', parents: ['c-a'], subject: 'feat: pago', recordedBranches: ['feature/pagos'] },
              { sha: 'c-a', parents: [], subject: 'feat: carrito', recordedBranches: ['feature/carrito'] },
            ],
          },
        ]}
        metric={null}
        setMetric={jest.fn()}
        port={new MockGithubAPI()}
        role="student"
        commitsTddCycles={null}
        typegraphs="graph"
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Seleccionar ramas' });
    expect(trigger).toHaveTextContent('feature/pagos');
    fireEvent.click(trigger);
    expect(screen.queryByRole('menuitemcheckbox', { name: 'Rama main' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Rama feature/pagos' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Rama feature/carrito' })).toHaveAttribute('aria-checked', 'false');
  });

  it('elige por defecto una rama con métricas cuando main solo tiene commits de contexto', () => {
    render(
      <TDDCharts
        commits={[
          { ...commits[0], sha: 'c-desc-2' },
          { ...commits[0], sha: 'c-red' },
          { ...commits[0], sha: 'c-desc-1' },
        ]}
        tddLogs={[
          {
            commitId: 'c-desc-1',
            commitName: 'test: descuento',
            commitTimestamp: 1,
            testId: 0,
            gitGraph: [
              { sha: 'merge', parents: ['c-desc-2', 'c-red'], subject: 'merge: integrar', historyBranch: 'main' },
              { sha: 'c-desc-2', parents: ['c-desc-1'], subject: 'fix: descuento', recordedBranches: ['descuentos'] },
              { sha: 'c-red', parents: ['root'], subject: 'feat: redondeo', recordedBranches: ['redondeo'] },
              { sha: 'c-desc-1', parents: ['root'], subject: 'test: descuento', recordedBranches: ['descuentos'] },
              { sha: 'root', parents: [], subject: 'chore: init', historyBranch: 'main' },
            ],
          },
        ]}
        metric={null}
        setMetric={jest.fn()}
        port={new MockGithubAPI()}
        role="student"
        commitsTddCycles={null}
        typegraphs="graph"
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Seleccionar ramas' });
    expect(trigger).toHaveTextContent('descuentos');
    fireEvent.click(trigger);
    expect(screen.getByRole('menuitemcheckbox', { name: 'Rama main' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Rama descuentos' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Rama redondeo' })).toHaveAttribute('aria-checked', 'false');
  });
});
