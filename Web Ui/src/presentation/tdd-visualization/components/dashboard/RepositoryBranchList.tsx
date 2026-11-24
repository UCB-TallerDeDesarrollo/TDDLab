import type { CSSProperties } from "react";
import type { TDDBranchView } from "../../types/tddVisualization.types";

interface RepositoryBranchListProps {
  branches: TDDBranchView[];
  selectedBranchName: string | null;
  onSelect: (branchName: string) => void;
}

export function RepositoryBranchList({
  branches,
  selectedBranchName,
  onSelect,
}: RepositoryBranchListProps) {
  if (!branches.length) {
    return <p className="tdd-dashboard__muted">No hay ramas para mostrar.</p>;
  }

  return (
    <div className="tdd-dashboard__branch-list">
      {branches.map((branch) => {
        const selected = branch.name === selectedBranchName;

        return (
          <button
            key={branch.name}
            type="button"
            className={`tdd-dashboard__branch-item${selected ? " tdd-dashboard__branch-item--active" : ""}`}
            style={{ "--branch-color": branch.color } as CSSProperties}
            data-branch={branch.name}
            aria-pressed={selected}
            onClick={() => onSelect(branch.name)}
          >
            <span className="tdd-dashboard__branch-dot" aria-hidden="true" />
            <span className="tdd-dashboard__branch-info">
              <span className="tdd-dashboard__branch-name">{branch.name}</span>
              <span className="tdd-dashboard__branch-meta">
                {branch.commits.length} commits
              </span>
            </span>
            <span className="tdd-dashboard__branch-count">
              {branch.executionCount} ejecuciones
            </span>
          </button>
        );
      })}
    </div>
  );
}
