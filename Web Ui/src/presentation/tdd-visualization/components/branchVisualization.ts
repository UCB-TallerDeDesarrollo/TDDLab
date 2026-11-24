import type { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import type {
  GitGraphCommit,
  TDDLogEntry,
  TestExecutionLog,
} from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import { getCommitBranches } from "./TDDCommitLanes";

export const BRANCH_PALETTE = [
  "#092d4a",
  "#2563eb",
  "#0d9488",
  "#7c3aed",
  "#d97706",
  "#be185d",
] as const;

export const DIMMED_FILL_COLOR = "rgba(148, 163, 184, 0.28)";
export const DIMMED_BORDER_COLOR = "rgba(148, 163, 184, 0.55)";

export type BranchSelection = "auto" | "all" | string[];

export interface BranchMetadata {
  branches: string[];
  defaultBranch: string;
  branchColorMap: ReadonlyMap<string, string>;
  commitBranchMap: ReadonlyMap<string, string[]>;
  branchCommitCounts: ReadonlyMap<string, number>;
  branchMeasuredCounts: ReadonlyMap<string, number>;
  forks: ReadonlySet<string>;
  merges: ReadonlySet<string>;
  branchesKey: string;
}

export function buildBranchMetadata(
  gitGraph?: GitGraphCommit[],
  measuredShas?: ReadonlySet<string>,
): BranchMetadata {
  const commitBranchMap = new Map<string, string[]>();
  const branchCommitCounts = new Map<string, number>();
  const branchMeasuredCounts = new Map<string, number>();
  const childCount = new Map<string, number>();
  const merges = new Set<string>();
  const visible = new Set((gitGraph ?? []).map(({ sha }) => sha));
  let newestBranch = "";
  let newestMeasuredBranch = "";

  for (const commit of gitGraph ?? []) {
    const commitBranches = getCommitBranches(commit);
    commitBranchMap.set(commit.sha, commitBranches);
    const isMeasured = measuredShas ? measuredShas.has(commit.sha) : false;

    if (!newestBranch && commitBranches.length > 0) {
      newestBranch = commitBranches[0];
    }
    if (isMeasured && !newestMeasuredBranch && commitBranches.length > 0) {
      newestMeasuredBranch = commitBranches[0];
    }

    for (const branch of commitBranches) {
      branchCommitCounts.set(branch, (branchCommitCounts.get(branch) ?? 0) + 1);
      if (isMeasured) {
        branchMeasuredCounts.set(branch, (branchMeasuredCounts.get(branch) ?? 0) + 1);
      }
    }
    if (commit.parents.length > 1) {
      merges.add(commit.sha);
    }
    for (const parent of commit.parents) {
      if (visible.has(parent)) {
        childCount.set(parent, (childCount.get(parent) ?? 0) + 1);
      }
    }
  }

  const uniqueBranches = [...branchCommitCounts.keys()];
  const mainHasMetrics = (branchMeasuredCounts.get("main") ?? 0) > 0;
  const anyBranchHasMetrics = branchMeasuredCounts.size > 0;

  let defaultBranch = "";
  if (uniqueBranches.includes("main") && (!anyBranchHasMetrics || mainHasMetrics)) {
    defaultBranch = "main";
  } else if (newestMeasuredBranch) {
    defaultBranch = newestMeasuredBranch;
  } else if (uniqueBranches.includes("main")) {
    defaultBranch = "main";
  } else {
    defaultBranch = newestBranch || uniqueBranches[0] || "";
  }

  const sortedBranches = uniqueBranches.sort((a, b) => {
    if (a === "main") return -1;
    if (b === "main") return 1;
    if (a === defaultBranch) return -1;
    if (b === defaultBranch) return 1;
    return a.localeCompare(b);
  });

  const branchColorMap = new Map<string, string>();
  sortedBranches.forEach((branch, index) => {
    branchColorMap.set(branch, BRANCH_PALETTE[index % BRANCH_PALETTE.length]);
  });

  const forks = new Set<string>();
  for (const [sha, count] of childCount.entries()) {
    if (count > 1) forks.add(sha);
  }

  return {
    branches: sortedBranches,
    defaultBranch,
    branchColorMap,
    commitBranchMap,
    branchCommitCounts,
    branchMeasuredCounts,
    forks,
    merges,
    branchesKey: `${sortedBranches.join("\0")}::${defaultBranch}`,
  };
}

export function resolveActiveBranches(
  selection: BranchSelection,
  meta: BranchMetadata,
): ReadonlySet<string> | null {
  if (meta.branches.length <= 1 || selection === "all") {
    return null;
  }

  if (selection === "auto") {
    return meta.defaultBranch ? new Set([meta.defaultBranch]) : null;
  }

  const valid = selection.filter((branch) => meta.branchColorMap.has(branch));
  if (valid.length === 0 || valid.length === meta.branches.length) {
    return null;
  }
  return new Set(valid);
}

export function toggleBranchSelection(
  selection: BranchSelection,
  branch: string,
  meta: BranchMetadata,
): BranchSelection {
  if (!meta.branchColorMap.has(branch) || meta.branches.length <= 1) {
    return "all";
  }

  const current = resolveActiveBranches(selection, meta);
  if (current === null) {
    return [branch];
  }

  if (current.has(branch)) {
    const remaining = [...current].filter((name) => name !== branch);
    return remaining.length === 0 ? "all" : remaining;
  }

  const next = [...current, branch];
  return next.length >= meta.branches.length ? "all" : next;
}

export function isCommitInActiveBranches(
  sha: string,
  meta: BranchMetadata,
  activeBranches: ReadonlySet<string> | null,
): boolean {
  if (activeBranches === null) {
    return true;
  }
  const commitBranches = meta.commitBranchMap.get(sha) ?? [];
  return commitBranches.some((branch) => activeBranches.has(branch));
}

export function getCommitBranchAccentColor(
  sha: string,
  meta: BranchMetadata,
  activeBranches: ReadonlySet<string> | null,
): string | undefined {
  const commitBranches = meta.commitBranchMap.get(sha) ?? [];
  if (commitBranches.length === 0) return undefined;
  if (activeBranches === null) {
    return meta.branchColorMap.get(commitBranches[0]);
  }
  const matched = commitBranches.find((branch) => activeBranches.has(branch));
  return matched ? meta.branchColorMap.get(matched) : undefined;
}

export function getSharedActiveBranch(
  shaA: string,
  shaB: string,
  meta: BranchMetadata,
  activeBranches: ReadonlySet<string> | null,
): string | undefined {
  const branchesA = meta.commitBranchMap.get(shaA) ?? [];
  const branchesB = new Set(meta.commitBranchMap.get(shaB) ?? []);
  return branchesA.find(
    (branch) =>
      branchesB.has(branch) &&
      (activeBranches === null || activeBranches.has(branch)),
  );
}

export function containsRefactor(commitMessage: string): boolean {
  return /\brefactor(\w*)\b/i.test(commitMessage);
}

export function getColorByCoverage(coverage: number, isRefactor: boolean): string {
  const colorValue = 110;
  let opacity: number;

  if (coverage >= 90) {
    opacity = 1;
  } else if (coverage >= 80) {
    opacity = 0.8;
  } else if (coverage >= 70) {
    opacity = 0.6;
  } else if (coverage >= 60) {
    opacity = 0.4;
  } else {
    opacity = 0.2;
  }

  return isRefactor
    ? `rgba(0, 100, 255, ${opacity})`
    : `rgba(0, ${colorValue}, 0, ${opacity})`;
}

export function getCommitColor(commit: CommitDataObject): string {
  if (
    !commit ||
    typeof commit !== "object" ||
    !commit.commit ||
    typeof commit.commit.message !== "string"
  ) {
    return "red";
  }

  const {
    coverage,
    test_count,
    conclusion,
    commit: { message },
  } = commit;

  if (conclusion === "failure") {
    return "red";
  }

  if (coverage === undefined || coverage === null) {
    return "black";
  }

  if (test_count === undefined || test_count === 0) {
    return conclusion === "neutral" ? "#64748b" : "red";
  }

  return getColorByCoverage(coverage, containsRefactor(message));
}

export function formatCoverageLabel(coverage: number | null | undefined): string {
  return coverage === null || coverage === undefined ? "Sin datos" : `${coverage}%`;
}

export function indexTestsByCommit(logs: TDDLogEntry[]): Map<string, TestExecutionLog[]> {
  const cycles = new Map<number, { commits: string[]; tests: TestExecutionLog[] }>();
  for (const log of logs) {
    if (!Number.isSafeInteger(log.testId)) continue;
    const cycle = cycles.get(log.testId) ?? { commits: [], tests: [] };
    if ("commitId" in log) cycle.commits.push(log.commitId);
    else cycle.tests.push(log);
    cycles.set(log.testId, cycle);
  }

  const byCommit = new Map<string, TestExecutionLog[]>();
  for (const { commits, tests } of cycles.values()) {
    const [sha] = commits;
    if (commits.length !== 1 || !sha || sha === "HEAD") continue;
    byCommit.set(sha, [...(byCommit.get(sha) ?? []), ...tests]);
  }
  return byCommit;
}

export interface MeasuredTrajectoryEdge {
  fromSha: string;
  toSha: string;
  sameBranch: boolean;
  branch?: string;
}

export function buildMeasuredTrajectoryEdges(
  gitGraph: GitGraphCommit[] | undefined,
  measuredShas: ReadonlySet<string>,
  meta: BranchMetadata,
): MeasuredTrajectoryEdge[] {
  if (!gitGraph || gitGraph.length < 2 || measuredShas.size < 2) {
    return [];
  }

  const nodeBySha = new Map(gitGraph.map((node) => [node.sha, node]));
  const edges: MeasuredTrajectoryEdge[] = [];
  const seen = new Set<string>();

  for (const node of gitGraph) {
    if (!measuredShas.has(node.sha)) continue;
    const childBranches = meta.commitBranchMap.get(node.sha) ?? [];
    const childBranchSet = new Set(childBranches);

    // Walk ancestors until the nearest measured commit along each parent path.
    const queue = [...node.parents];
    const visited = new Set<string>([node.sha]);
    while (queue.length > 0) {
      const ancestorSha = queue.shift()!;
      if (visited.has(ancestorSha)) continue;
      visited.add(ancestorSha);

      if (measuredShas.has(ancestorSha)) {
        const edgeKey = `${ancestorSha}->${node.sha}`;
        if (!seen.has(edgeKey)) {
          seen.add(edgeKey);
          const ancestorBranches = meta.commitBranchMap.get(ancestorSha) ?? [];
          const shared = ancestorBranches.find((b) => childBranchSet.has(b));
          edges.push({
            fromSha: ancestorSha,
            toSha: node.sha,
            sameBranch: Boolean(shared),
            branch: shared ?? childBranches[0],
          });
        }
        continue;
      }

      const ancestorNode = nodeBySha.get(ancestorSha);
      if (ancestorNode) {
        queue.push(...ancestorNode.parents);
      }
    }
  }

  return edges;
}
