import React, { useEffect, useRef, useState } from "react";
import type { BranchMetadata } from "./branchVisualization";

interface BranchFocusBarProps {
  meta: BranchMetadata;
  selectedBranches: ReadonlySet<string> | null;
  previewBranch?: string | "all" | null;
  onToggleBranch: (branch: string) => void;
  onSelectAll: () => void;
  onPreviewBranch?: (branch: string | "all" | null) => void;
  onViewHistory?: () => void;
}

const BranchFocusBar: React.FC<BranchFocusBarProps> = ({
  meta,
  selectedBranches,
  previewBranch = null,
  onToggleBranch,
  onSelectAll,
  onPreviewBranch,
  onViewHistory,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
        onPreviewBranch?.(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        onPreviewBranch?.(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onPreviewBranch]);

  if (meta.branches.length === 0) {
    return null;
  }

  if (meta.branches.length === 1) {
    const singleBranch = meta.branches[0];
    const color = meta.branchColorMap.get(singleBranch) ?? "#092d4a";
    const count = meta.branchCommitCounts.get(singleBranch) ?? 0;

    return (
      <div className="tdd-branch-bar tdd-branch-bar--single" aria-label="Rama del repositorio">
        <div className="tdd-branch-bar-group">
          <span className="tdd-branch-bar-label">Rama</span>
          <span className="tdd-branch-pill tdd-branch-pill--static" title={singleBranch}>
            <span className="tdd-branch-dot" style={{ backgroundColor: color }} aria-hidden="true" />
            <span className="tdd-branch-name">{singleBranch}</span>
            {count > 0 && <span className="tdd-branch-count">{count}</span>}
          </span>
        </div>
        {onViewHistory && (
          <button type="button" className="tdd-branch-history-link" onClick={onViewHistory}>
            Ver grafo de commits
          </button>
        )}
      </div>
    );
  }

  const allSelected = selectedBranches === null;
  const selectedList = allSelected
    ? []
    : meta.branches.filter((name) => selectedBranches.has(name));

  let triggerLabel: string;
  let triggerDotColor: string | null = null;
  if (allSelected) {
    triggerLabel = `Todas (${meta.branches.length})`;
  } else if (selectedList.length === 1) {
    triggerLabel = selectedList[0];
    triggerDotColor = meta.branchColorMap.get(selectedList[0]) ?? "#092d4a";
  } else {
    triggerLabel = `${selectedList.length} de ${meta.branches.length} ramas`;
  }

  const handleToggleMenu = () => {
    setOpen((prev) => {
      if (prev) onPreviewBranch?.(null);
      return !prev;
    });
  };

  return (
    <div className="tdd-branch-bar" role="region" aria-label="Control de ramas">
      <div className="tdd-branch-bar-main">
        <div className="tdd-branch-bar-group">
          <span className="tdd-branch-bar-label">Ramas</span>
          <div className="tdd-branch-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className={`tdd-branch-trigger${open ? " tdd-branch-trigger--open" : ""}`}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Seleccionar ramas"
              onClick={handleToggleMenu}
            >
              {triggerDotColor && (
                <span
                  className="tdd-branch-dot"
                  style={{ backgroundColor: triggerDotColor }}
                  aria-hidden="true"
                />
              )}
              <span className="tdd-branch-trigger-label" title={triggerLabel}>
                {triggerLabel}
              </span>
              {!allSelected && selectedList.length === 1 && (
                <span className="tdd-branch-count">
                  1/{meta.branches.length}
                </span>
              )}
              <svg
                className={`tdd-branch-chevron${open ? " tdd-branch-chevron--open" : ""}`}
                width="14"
                height="14"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  d="M4 6l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {open && (
              <div
                className="tdd-branch-menu"
                role="menu"
                aria-label="Ramas disponibles"
                onMouseLeave={() => onPreviewBranch?.(null)}
              >
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={allSelected}
                  className={`tdd-branch-option tdd-branch-option--all${allSelected ? " tdd-branch-option--selected" : ""}${previewBranch === "all" ? " tdd-branch-option--preview" : ""}`}
                  onMouseEnter={() => onPreviewBranch?.("all")}
                  onFocus={() => onPreviewBranch?.("all")}
                  onClick={() => {
                    onSelectAll();
                    onPreviewBranch?.(null);
                  }}
                >
                  <span
                    className={`tdd-branch-check${allSelected ? " tdd-branch-check--checked" : ""}`}
                    aria-hidden="true"
                  >
                    {allSelected ? "✓" : ""}
                  </span>
                  <span className="tdd-branch-option-name">Todas las ramas</span>
                  <span className="tdd-branch-count">{meta.branches.length}</span>
                </button>

                <div className="tdd-branch-menu-divider" role="separator" />

                {meta.branches.map((name) => {
                  const isChecked = !allSelected && selectedBranches.has(name);
                  const isPreviewed = previewBranch === name;
                  const color = meta.branchColorMap.get(name) ?? "#2563eb";
                  const totalCount = meta.branchCommitCounts.get(name) ?? 0;
                  const measuredCount = meta.branchMeasuredCounts.get(name) ?? 0;
                  const contextOnly = meta.branchMeasuredCounts.size > 0 && measuredCount === 0;

                  return (
                    <button
                      key={name}
                      type="button"
                      role="menuitemcheckbox"
                      aria-checked={isChecked}
                      aria-label={`Rama ${name}`}
                      title={
                        contextOnly
                          ? `${name} (${totalCount} de contexto)`
                          : `${name} (${totalCount} commits)`
                      }
                      className={`tdd-branch-option${isChecked ? " tdd-branch-option--selected" : ""}${isPreviewed ? " tdd-branch-option--preview" : ""}`}
                      onMouseEnter={() => onPreviewBranch?.(name)}
                      onFocus={() => onPreviewBranch?.(name)}
                      onClick={() => onToggleBranch(name)}
                    >
                      <span
                        className={`tdd-branch-check${isChecked ? " tdd-branch-check--checked" : ""}`}
                        style={
                          isChecked
                            ? { backgroundColor: color, borderColor: color }
                            : undefined
                        }
                        aria-hidden="true"
                      >
                        {isChecked ? "✓" : ""}
                      </span>
                      <span
                        className="tdd-branch-dot"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                      <span className="tdd-branch-option-name">{name}</span>
                      {totalCount > 0 && (
                        <span className="tdd-branch-count">
                          {totalCount}
                          {contextOnly ? " ctx" : ""}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="tdd-branch-menu-footer">
                  Pasa el cursor para previsualizar · clic para fijar
                </div>
              </div>
            )}
          </div>

          {!allSelected && selectedList.length > 1 && (
            <div className="tdd-branch-selected-chips" aria-label="Ramas fijadas">
              {selectedList.map((name) => {
                const color = meta.branchColorMap.get(name) ?? "#2563eb";
                return (
                  <button
                    key={name}
                    type="button"
                    className="tdd-branch-chip"
                    title={`Quitar ${name}`}
                    onClick={() => onToggleBranch(name)}
                  >
                    <span
                      className="tdd-branch-dot"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                    <span className="tdd-branch-name">{name}</span>
                    <span className="tdd-branch-chip-remove" aria-hidden="true">×</span>
                  </button>
                );
              })}
            </div>
          )}

          {previewBranch && (
            <span className="tdd-branch-preview-badge" aria-live="polite">
              Vista previa:{" "}
              <strong>{previewBranch === "all" ? "Todas las ramas" : previewBranch}</strong>
            </span>
          )}
        </div>

        {onViewHistory && (
          <button type="button" className="tdd-branch-history-link" onClick={onViewHistory}>
            Ver grafo completo
          </button>
        )}
      </div>
    </div>
  );
};

export default BranchFocusBar;
