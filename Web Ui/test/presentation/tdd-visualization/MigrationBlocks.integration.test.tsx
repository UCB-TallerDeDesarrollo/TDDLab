import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import TDDCycleList from '../../../src/presentation/tdd-visualization/components/TDDCycleList';
import TDDCharts from '../../../src/presentation/tdd-visualization/components/TDDChart';
import { CommitDataObject } from '../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces';
import { FakeCommitHistoryRepository } from '../../../src/modules/TDDCycles-Visualization/repository/FakeCommitHistoryRepository';
import { MemoryRouter } from 'react-router-dom';
import TDDList from '../../../src/presentation/tdd-visualization/components/TDDList';

const commit = (conclusion: string, count: number, coverage: number, total = 4): CommitDataObject => ({
  sha: conclusion, html_url: `https://github.com/hu08/tests/commit/${conclusion}`,
  commit: { date: new Date('2026-11-25T14:00:00Z'), message: conclusion, url: `https://github.com/hu08/tests/commit/${conclusion}`, comment_count: 0 },
  stats: { total, additions: 3, deletions: 1 }, coverage, test_count: count, conclusion,
});

describe('HU08 paridad de los valores visibles en bloques', () => {
  it('muestra aprobados fallidos y sin tests con cobertura cero conservada', () => {
    const { container } = render(<TDDCycleList commitsInfo={[commit('success', 2, 100), commit('failure', 2, 0), commit('skipped', 0, 0)]} />);
    const cards = [...container.querySelectorAll('.cycleCardContainer')];
    expect(cards).toHaveLength(3);
    ['Resultado: Exitoso', 'Resultado: Fallido', 'Resultado: Sin tests'].forEach((label, index) => expect(within(cards[index] as HTMLElement).getByText(label)).toBeInTheDocument());
    expect(within(cards[1] as HTMLElement).getByText('0%')).toBeInTheDocument();
    expect(within(cards[2] as HTMLElement).getByText('Sin tests')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Ver commit' })[1]).toHaveAttribute('href', 'https://github.com/hu08/tests/commit/failure');
  });
  it('la lista conserva más de 100 modificaciones sin mutar los datos del repositorio', async () => {
    localStorage.setItem('selectedMetric', 'Lista');
    const source = commit('success', 2, 100, 200);
    Object.freeze(source.stats);Object.freeze(source);
    class SourceRepository extends FakeCommitHistoryRepository { async obtainCommitsOfRepo() { return [source]; } }
    render(<MemoryRouter><TDDCharts commits={[source]} tddLogs={[]} metric="Lista" setMetric={() => {}} port={new SourceRepository()} role="student" commitsTddCycles={[]} typegraphs="graph" /></MemoryRouter>);
    expect(await screen.findByText('200')).toBeInTheDocument();
    expect(source.stats.total).toBe(200);
  });
  it('consulta la rama seleccionada también en la vista de bloques', async () => {
    const repository = new FakeCommitHistoryRepository();
    const read = jest.spyOn(repository, 'obtainCommitsOfRepo').mockResolvedValue([commit('success', 2, 100)]);
    render(<MemoryRouter initialEntries={['/?repoOwner=hu08&repoName=tests&branch=feature%2Fhu08']}><TDDList port={repository} /></MemoryRouter>);
    expect(await screen.findByText('Resultado: Exitoso')).toBeInTheDocument();
    expect(read).toHaveBeenCalledWith('hu08', 'tests', 'feature/hu08');
  });
});
