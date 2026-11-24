import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import TDDCharts from '../../../src/presentation/tdd-visualization/components/TDDChart';
import type { CommitDataObject } from '../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces';
import type { GitGraphCommit, TDDLogEntry } from '../../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces';
import { MockGithubAPI } from './__mocks__/MocksCommitHistory';

const repoUrl = 'https://github.com/example/exercise';
const root = 'a'.repeat(40);
const left = 'b'.repeat(40);
const right = 'c'.repeat(40);
const merge = 'd'.repeat(40);
const time = Date.UTC(2026, 10, 21, 14);
const graph: GitGraphCommit[] = [
  { sha: root, parents: [], subject: 'Iniciar práctica', timestamp: time + 86_400_000, historyBranch: 'main' },
  { sha: right, parents: [root], subject: 'Redondear importes', timestamp: time + 2_000, recordedBranches: ['redondeo'] },
  { sha: left, parents: [root], subject: 'Registrar descuento pendiente', timestamp: time + 3_000, recordedBranches: ['descuentos'] },
  { sha: merge, parents: [left, right], subject: 'Integrar ramas', timestamp: time + 4_000, historyBranch: 'main' },
];
const logs: TDDLogEntry[] = graph.map((node, testId) => ({
  commitId: node.sha,
  commitName: node.subject,
  commitTimestamp: node.timestamp ?? time,
  testId,
  gitGraph: node.sha === left ? [node, graph[0]] : [node],
}));
const commits: CommitDataObject[] = [
  {
    sha: left, html_url: `${repoUrl}/commit/${left}`,
    stats: { total: 125, additions: 125, deletions: 0 },
    commit: { date: new Date(time + 3_000), message: 'Registrar descuento pendiente', url: '', comment_count: 0 },
    coverage: 0, test_count: 1, conclusion: 'failure',
  },
  {
    sha: right, html_url: `${repoUrl}/commit/${right}`,
    stats: { total: 2, additions: 1, deletions: 1 },
    commit: { date: new Date(time + 2_000), message: 'Redondear importes', url: '', comment_count: 0 },
    coverage: null, test_count: 2, conclusion: 'success',
  },
];

function renderHistory(metrics: CommitDataObject[], data: TDDLogEntry[]) {
  return render(
    <MemoryRouter initialEntries={['/graph?repoOwner=example&repoName=exercise']}>
      <TDDCharts
        commits={metrics} tddLogs={data} metric="Lista" setMetric={jest.fn()}
        port={new MockGithubAPI()} role="student" commitsTddCycles={[]} typegraphs="graph"
      />
    </MemoryRouter>,
  );
}

describe('Commit history with the ingestion read contract', () => {
  beforeEach(() => localStorage.setItem('selectedMetric', 'Lista'));
  afterEach(() => localStorage.clear());

  it('joins graph fragments by SHA and keeps parents before their children despite clock skew', () => {
    renderHistory(commits, logs);

    const history = screen.getByRole('list', { name: 'Historial de commits' });
    const rows = within(history).getAllByRole('listitem');
    expect(rows).toHaveLength(4);
    expect(rows[0]).toHaveAttribute('data-commit', root);
    expect(rows[rows.length - 1]).toHaveAttribute('data-commit', merge);
    expect(within(history).getByText('Bifurcación')).toBeInTheDocument();
    expect(within(history).getByText('Merge')).toBeInTheDocument();
    expect(within(history).getAllByText('Sin métricas registradas')).toHaveLength(2);
    expect(history.querySelectorAll('path[data-parent]')).toHaveLength(4);
    expect(within(history).getAllByRole('link', { name: 'Ver commit' })).toHaveLength(4);
    expect(within(rows[0]).getByRole('link', { name: 'Ver commit' })).toHaveAttribute('href', `${repoUrl}/commit/${root}`);
  });

  it('keeps metrics and history numbers attached to the same SHA when highlighting or reversing', () => {
    renderHistory(commits, logs);

    const failed = screen.getByText('Registrar descuento pendiente').closest('li');
    expect(failed).toHaveTextContent('Fallido');
    expect(failed).toHaveTextContent('Total de modificaciones: 125');
    expect(failed).toHaveTextContent('Cobertura: 0%');
    const number = failed?.querySelector('.commit-number')?.textContent;
    expect(number).toMatch(/^#\d+$/);
    expect(screen.getByText('Redondear importes').closest('li')).toHaveTextContent('Cobertura: Sin datos');

    fireEvent.change(screen.getByRole('combobox', { name: 'Resaltar rama' }), { target: { value: 'descuentos' } });
    expect(failed).toHaveAttribute('data-branch-highlighted', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar commits más recientes primero' }));
    expect(failed?.querySelector('.commit-number')?.textContent).toBe(number);
    expect(within(screen.getByRole('list', { name: 'Historial de commits' })).getAllByRole('listitem')[0])
      .toHaveAttribute('data-commit', merge);
    expect(screen.queryByRole('img', { name: /Ejecución (exitosa|con fallos)/ })).not.toBeInTheDocument();
  });

  it('shows a successful empty read as an empty history', () => {
    renderHistory([], []);

    expect(screen.getByRole('status')).toHaveTextContent('No hay commits registrados.');
    expect(screen.queryByText('No se pudo cargar la información')).not.toBeInTheDocument();
  });
});
