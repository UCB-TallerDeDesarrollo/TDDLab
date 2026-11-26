import type {
  CommitGraphNodeBranchSupport,
  TopologyGraphResponseBranchSupport,
} from "../modules/TDDCycles-Visualization/domain/ITopologyGraphBranchSupport";

// =====================================================
// TIPOS PARA LA VISUALIZACIÓN
// =====================================================

export interface GitGraphNode {
  sha: string;
  shortSha: string;
  x: number;
  y: number;
  lane: number;
  message: string;
  author: string;
  date: Date;
  branches: string[];
  parents: string[];
  testRuns: number;
  coverage: number | null;
  conclusion: string | null;
  isMerge: boolean;
}

export interface GitGraphEdge {
  id: string;
  parentSha: string;
  childSha: string;
  parentOrder: number;
  path: string;
}

export interface GitGraphLayout {
  nodes: GitGraphNode[];
  edges: GitGraphEdge[];
  branches: string[];
  width: number;
  height: number;
  missingParents: string[];
}

const LEFT_PADDING = 100;
const RIGHT_PADDING = 100;
const TOP_PADDING = 90;
const BOTTOM_PADDING = 65;
const COLUMN_GAP = 100;
const LANE_GAP = 90;

// =====================================================
// ORDEN TOPOLÓGICO
// =====================================================

// Un commit solamente aparece después de los padres
// que estén presentes en la respuesta.
//
// Se utiliza SHA como identidad para evitar que un
// commit compartido entre varias ramas se duplique.

function orderCommits(
  commits: CommitGraphNodeBranchSupport[]
): CommitGraphNodeBranchSupport[] {
  const unique = new Map(
    commits.map((commit) => [commit.sha, commit])
  );

  const ordered: CommitGraphNodeBranchSupport[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const sorted = [...unique.values()].sort(
    (a, b) =>
      new Date(a.committed_at).getTime() -
      new Date(b.committed_at).getTime() ||
      a.sha.localeCompare(b.sha)
  );

  function visit(sha: string): void {
    if (visited.has(sha) || visiting.has(sha)) {
      return;
    }

    const commit = unique.get(sha);
    if (!commit) return;

    visiting.add(sha);

    for (const parent of commit.parents ?? []) {
      if (unique.has(parent)) {
        visit(parent);
      }
    }

    visiting.delete(sha);
    visited.add(sha);
    ordered.push(commit);
  }

  sorted.forEach((commit) => visit(commit.sha));

  return ordered;
}

// =====================================================
// ASIGNACIÓN DE RAMAS A CARRILES
// =====================================================

function getBranchNames(
  topology: TopologyGraphResponseBranchSupport
): string[] {
  const names = new Set<string>();

  topology.branches.forEach((branch) => {
    names.add(branch.name);
  });

  topology.nodes.forEach((node) => {
    node.branches.forEach((branch) => {
      names.add(branch);
    });
  });

  const ordered = [...names];

  const defaultBranch = topology.default_branch;

  if (ordered.includes(defaultBranch)) {
    return [
      defaultBranch,
      ...ordered.filter((branch) => branch !== defaultBranch),
    ];
  }

  return ordered;
}

function getNodeLane(
  branches: string[],
  allBranches: string[],
  defaultBranch: string
): number {
  if (branches.length === 0) {
    return 0;
  }

  // Un commit compartido entre varias ramas
  // aparece una sola vez, en el primer carril
  // disponible según el orden establecido.

  if (branches.includes(defaultBranch)) {
    return Math.max(
      0,
      allBranches.indexOf(defaultBranch)
    );
  }

  for (const branch of allBranches) {
    if (branches.includes(branch)) {
      return allBranches.indexOf(branch);
    }
  }

  return 0;
}

// =====================================================
// CONSTRUIR LA GEOMETRÍA DEL GRAFO
// =====================================================

export function buildGitGraphLayout(
  topology: TopologyGraphResponseBranchSupport
): GitGraphLayout {
  const orderedCommits = orderCommits(
    topology.nodes ?? []
  );

  const branches = getBranchNames(topology);

  const positions = new Map<string, GitGraphNode>();

  // Utilizamos los padres de nodes y también edges,
  // porque ambos campos están disponibles en la API.

  const parentsByChild = new Map<string, string[]>();

  for (const commit of orderedCommits) {
    parentsByChild.set(
      commit.sha,
      [...new Set(commit.parents ?? [])]
    );
  }

  for (const edge of topology.edges ?? []) {
    const previous = parentsByChild.get(edge.child_sha) ?? [];

    if (!previous.includes(edge.parent_sha)) {
      parentsByChild.set(edge.child_sha, [
        ...previous,
        edge.parent_sha,
      ]);
    }
  }

  // Los niveles dependen de la profundidad real
  // del historial de Git, no solamente de la fecha.

  const levels = new Map<string, number>();

  function getLevel(
    sha: string,
    visited = new Set<string>()
  ): number {
    if (levels.has(sha)) {
      return levels.get(sha)!;
    }

    if (visited.has(sha)) {
      return 0;
    }

    const nextVisited = new Set(visited);
    nextVisited.add(sha);

    const parents = parentsByChild.get(sha) ?? [];

    const parentLevels = parents
      .filter((parent) =>
        orderedCommits.some((commit) => commit.sha === parent)
      )
      .map((parent) =>
        getLevel(parent, nextVisited)
      );

    const level = parentLevels.length
      ? Math.max(...parentLevels) + 1
      : 0;

    levels.set(sha, level);
    return level;
  }

  const nodes: GitGraphNode[] = orderedCommits.map(
    (commit) => {
      const commitBranches = commit.branches ?? [];

      const lane = getNodeLane(
        commitBranches,
        branches,
        topology.default_branch
      );

      const level = getLevel(commit.sha);

      const node: GitGraphNode = {
        sha: commit.sha,
        shortSha: commit.sha.substring(0, 7),
        x: LEFT_PADDING + level * COLUMN_GAP,
        y: TOP_PADDING + lane * LANE_GAP,
        lane,
        message: commit.message,
        author: commit.author,
        date: new Date(commit.committed_at),
        branches: commitBranches,
        parents: parentsByChild.get(commit.sha) ?? [],
        testRuns: commit.test_runs_count ?? 0,
        coverage: commit.latest_coverage ?? null,
        conclusion: commit.latest_conclusion ?? null,
        isMerge:
          (parentsByChild.get(commit.sha)?.length ?? 0) > 1,
      };

      positions.set(node.sha, node);

      return node;
    }
  );

  // ===================================================
  // RELACIONES ENTRE COMMITS
  // ===================================================

  const edges: GitGraphEdge[] = [];
  const missingParents = new Set<string>();

  const graphEdges = topology.edges?.length
    ? topology.edges
    : nodes.flatMap((node) =>
        node.parents.map((parent, index) => ({
          parent_sha: parent,
          child_sha: node.sha,
          parent_order: index,
        }))
      );

  const seenEdges = new Set<string>();

  for (const edge of graphEdges) {
    const parent = positions.get(edge.parent_sha);
    const child = positions.get(edge.child_sha);

    if (!parent) {
      missingParents.add(edge.parent_sha);
      continue;
    }

    if (!child) {
      continue;
    }

    const id = `${edge.parent_sha}-${edge.child_sha}`;

    if (seenEdges.has(id)) {
      continue;
    }

    seenEdges.add(id);

    // Curva SVG que conecta el commit padre
    // con el commit hijo.

    const distance = child.x - parent.x;

    const controlOffset = Math.max(
      25,
      Math.abs(distance) / 2
    );

    const path = [
      `M ${parent.x} ${parent.y}`,
      `C ${parent.x + controlOffset} ${parent.y}`,
      `${child.x - controlOffset} ${child.y}`,
      `${child.x} ${child.y}`,
    ].join(" ");

    edges.push({
      id,
      parentSha: edge.parent_sha,
      childSha: edge.child_sha,
      parentOrder: edge.parent_order,
      path,
    });
  }

  const maxX = nodes.length
    ? Math.max(...nodes.map((node) => node.x))
    : LEFT_PADDING;

  const maxLane = nodes.length
    ? Math.max(...nodes.map((node) => node.lane))
    : 0;

  const width = Math.max(
    650,
    maxX + RIGHT_PADDING
  );

  const height = Math.max(
    250,
    TOP_PADDING +
      Math.max(maxLane, branches.length - 1) * LANE_GAP +
      BOTTOM_PADDING
  );

  return {
    nodes,
    edges,
    branches,
    width,
    height,
    missingParents: [...missingParents],
  };
}
