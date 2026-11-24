import { fireEvent, render, screen, within } from "@testing-library/react";
import TDDCycleList from "../../../src/presentation/tdd-visualization/components/TDDCycleList";
import { mockCommitData } from "./__mocks__/dataTypeMocks/commitData";
import { convertToCommitDataObject } from "./__mocks__/MocksCommitHistory.ts"; 
import "@testing-library/jest-dom";

describe("TDDCycleList Component", () => {
  test("renders a list of cycle cards when provided with commits and jobs data", () => {
    const commitsInfo = [convertToCommitDataObject(mockCommitData)];

    render(
      <TDDCycleList commitsInfo={commitsInfo} />
    );
    const cycleCards = document.getElementsByClassName("cycleCardContainer");
    expect(cycleCards.length).toBeGreaterThanOrEqual(1);
  });

  test("integrates the merge and branch lanes into the original commit cards", () => {
    const measured = convertToCommitDataObject(mockCommitData);
    render(<TDDCycleList
      commitsInfo={[{ ...measured, sha: 'left' }, { ...measured, sha: 'older' }]}
      repoUrl="https://github.com/fixture/practice"
      gitGraph={[
        { sha: 'merge', parents: ['left', 'right'], subject: 'Integración', timestamp: Date.UTC(2026, 10, 4, 21, 15) },
        { sha: 'left', parents: ['root'], subject: 'Cálculo', recordedBranches: ['descuentos'] },
        { sha: 'right', parents: ['root'], subject: 'Redondeo' },
        { sha: 'root', parents: [], subject: 'Inicio', historyBranch: 'main' },
      ]}
    />);

    const history = screen.getByRole('list', { name: 'Historial de commits' });
    expect(history.querySelectorAll('.cycleCardContainer')).toHaveLength(2);
    const merge = history.querySelector('[data-commit="merge"]') as HTMLElement;
    expect(within(merge).getByText('Merge')).toBeInTheDocument();
    expect(within(merge).getByText('Sin métricas registradas')).toBeInTheDocument();
    expect(within(merge).getByText(/17:15:00/)).toHaveAttribute('datetime', '2026-11-04T21:15:00.000Z');
    const oldRow = history.querySelector('[data-commit="right"]') as HTMLElement;
    expect(within(oldRow).getByText('Fecha no disponible')).toBeInTheDocument();
    expect(screen.getByText('Hora de Bolivia (UTC−4)')).toBeInTheDocument();
    expect(within(merge).getByRole('link', { name: 'Ver commit' })).toHaveAttribute('href', 'https://github.com/fixture/practice/commit/merge');
    expect(Array.from(merge.querySelectorAll('path[data-parent]')).map((path) => path.getAttribute('data-parent')))
      .toEqual(['left', 'right']);
    expect(history.lastElementChild).toBe(merge);
    expect(within(merge).getByText('#5')).toBeInTheDocument();
    const measuredRow = history.querySelector('[data-commit="left"]') as HTMLElement;
    expect(within(measuredRow).getByText('#4')).toBeInTheDocument();
    expect(measuredRow).toHaveAttribute('data-secondary-branch', 'true');
    expect(history.querySelector('[data-commit="root"]')).not.toHaveAttribute('data-secondary-branch');

    fireEvent.change(screen.getByRole('combobox', { name: 'Resaltar rama' }), { target: { value: 'descuentos' } });
    expect(measuredRow).toHaveAttribute('data-branch-highlighted', 'true');
    expect(merge).not.toHaveAttribute('data-branch-highlighted');
    expect(history.querySelectorAll('path[data-parent]')).toHaveLength(4);

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar commits más recientes primero' }));
    expect(history.firstElementChild).toBe(merge);
    expect(within(measuredRow).getByText('#4')).toBeInTheDocument();
    expect(screen.getByText('Bifurcación')).toBeInTheDocument();
  });

  test("renders nothing when provided with no commits and jobs data", () => {
    render(<TDDCycleList commitsInfo={null} />);
    const cycleCards = document.getElementsByClassName("cycleCardContainer");
    expect(cycleCards.length).toBe(0);
  });
});