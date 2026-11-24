import type { TDDDashboardViewState } from "../../types/tddVisualization.types";
import "../../styles/TDDDashboard.css";
import { RepositoryBranchList } from "./RepositoryBranchList";
import { TDDChartSummary } from "./TDDChartSummary";
import { TDDExecutionChart } from "./TDDExecutionChart";
import { TDDEmptyState } from "./TDDEmptyState";

interface TDDDashboardProps {
  state: TDDDashboardViewState;
}

export function TDDDashboard({ state }: TDDDashboardProps) {
  const {
    branches,
    selectedBranch,
    selectedBranchName,
    selectBranch,
    chartData,
    summary,
    hasExecutions,
  } = state;

  return (
    <div className="tdd-dashboard">
      <section
        className="tdd-dashboard__panel tdd-dashboard__panel--git"
        aria-labelledby="tdd-dashboard-branches-title"
      >
        <h2 id="tdd-dashboard-branches-title">Ramas del repositorio</h2>
        <p className="tdd-dashboard__subtitle">
          Selecciona una rama para visualizar sus ciclos TDD.
        </p>

        <RepositoryBranchList
          branches={branches}
          selectedBranchName={selectedBranchName}
          onSelect={selectBranch}
        />
      </section>

      <section
        className="tdd-dashboard__panel tdd-dashboard__panel--tdd"
        aria-labelledby="tdd-dashboard-cycle-title"
      >
        <div className="tdd-dashboard__chart-header">
          <div>
            <h2 id="tdd-dashboard-cycle-title">
              Ciclo de ejecución de pruebas TDD
            </h2>
            <p className="tdd-dashboard__subtitle tdd-dashboard__subtitle--inline">
              Resultados de las ejecuciones por commit.
            </p>
          </div>

          {selectedBranch && (
            <div className="tdd-dashboard__selected-branch">
              <span
                className="tdd-dashboard__selected-branch-dot"
                style={{ backgroundColor: selectedBranch.color }}
                aria-hidden="true"
              />
              <span data-testid="tdd-selected-branch">{selectedBranch.name}</span>
            </div>
          )}
        </div>

        {!selectedBranch ? (
          <TDDEmptyState
            title="No hay datos del repositorio."
            description="No se encontraron commits para construir el dashboard."
          />
        ) : !hasExecutions ? (
          <TDDEmptyState
            title="No se tiene ejecución de pruebas"
            description="Esta rama todavía no tiene ejecuciones TDD registradas."
          />
        ) : (
          <>
            <TDDExecutionChart data={chartData} branchName={selectedBranch.name} />
            <TDDChartSummary summary={summary} />
          </>
        )}
      </section>
    </div>
  );
}
