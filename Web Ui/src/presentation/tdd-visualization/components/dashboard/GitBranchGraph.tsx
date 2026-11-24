import type { KeyboardEvent } from "react";
import type { TDDBranchView } from "../../types/tddVisualization.types";
import { TDD_DASHBOARD_LAYOUT as LAYOUT } from "./dashboard.constants";

interface GitBranchGraphProps {
  branches: TDDBranchView[];
  selectedBranchName: string | null;
  onSelect: (branchName: string) => void;
}

interface BranchGeometry {
  branch: TDDBranchView;
  side: "left" | "right";
  forkY: number;
  node: { x: number; y: number };
}

export function GitBranchGraph({
  branches,
  selectedBranchName,
  onSelect,
}: GitBranchGraphProps) {
  if (!branches.length) {
    return (
      <p className="tdd-dashboard__graph-empty">No hay historial para mostrar.</p>
    );
  }

  const centerX = LAYOUT.graphWidth / 2;
  const main = branches.find((branch) => branch.name === "main") ?? branches[0];
  const others = branches.filter((branch) => branch !== main);
  const mainY = LAYOUT.mainBaseY + others.length * LAYOUT.branchRise;
  const highestForkY = mainY - others.length * LAYOUT.branchRise;
  const height = mainY + LAYOUT.graphBottomPadding;
  const sideX = LAYOUT.graphSideX;

  const positions = new Map<string, { x: number; y: number }>([
    [main.name, { x: centerX, y: mainY }],
  ]);

  const branchGeometry: BranchGeometry[] = others.map((branch, index) => {
    const side = index % 2 === 0 ? "left" : "right";
    const forkY = mainY - (index + 1) * LAYOUT.branchRise;
    const node = {
      x: sideX[side],
      y: forkY - LAYOUT.nodeOffsetY,
    };
    positions.set(branch.name, node);
    return { branch, side, forkY, node };
  });

  const handleKeyDown = (
    event: KeyboardEvent<SVGGElement>,
    branchName: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(branchName);
    }
  };

  return (
    <svg
      className="tdd-dashboard__git-graph"
      viewBox={`0 0 ${LAYOUT.graphWidth} ${height}`}
      role="group"
      aria-label="Historial de ramas del repositorio"
    >
      <path
        className="tdd-dashboard__graph-edge"
        stroke={main.color}
        d={`M ${centerX} ${height - 12} L ${centerX} ${highestForkY - 8}`}
      />

      {branchGeometry.map(({ branch, side, forkY, node }) => {
        const direction = side === "left" ? -1 : 1;
        const spread = Math.abs(node.x - centerX);
        const controlX1 = centerX + direction * (spread * 0.18);
        const controlX2 = node.x - direction * (spread * 0.12);

        return (
          <path
            key={`edge-${branch.name}`}
            className="tdd-dashboard__graph-edge"
            stroke={branch.color}
            d={`M ${centerX} ${forkY} C ${controlX1} ${forkY - 8}, ${controlX2} ${node.y + 18}, ${node.x} ${node.y}`}
          />
        );
      })}

      {branches.map((branch) => {
        const point = positions.get(branch.name);
        if (!point) {
          return null;
        }

        const selected = branch.name === selectedBranchName;
        const labelY = branch === main ? point.y + 25 : point.y - 16;

        return (
          <g
            key={branch.name}
            className={`tdd-dashboard__graph-node${selected ? " tdd-dashboard__graph-node--selected" : ""}`}
            data-branch={branch.name}
            role="button"
            tabIndex={0}
            aria-label={`Seleccionar rama ${branch.name}`}
            aria-pressed={selected}
            onClick={() => onSelect(branch.name)}
            onKeyDown={(event) => handleKeyDown(event, branch.name)}
          >
            <circle
              cx={point.x}
              cy={point.y}
              r={selected ? 9 : 7}
              fill={branch.color}
            />
            <text
              x={point.x}
              y={labelY}
              textAnchor="middle"
              fontWeight={selected ? 700 : 400}
            >
              {branch.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
