import type { GitGraphCommit, TDDLogEntry } from './TDDLogInterfaces';

export function getCommitGraph(logs: TDDLogEntry[] | null): GitGraphCommit[] | undefined {
  const nodes = new Map((logs ?? [])
    .flatMap(log => 'commitId' in log ? log.gitGraph ?? [] : [])
    .map(node => [node.sha, node]));
  if (nodes.size === 0) return undefined;

  const children = new Map<string, number>();
  for (const node of nodes.values()) {
    for (const parent of node.parents) {
      children.set(parent, (children.get(parent) ?? 0) + 1);
    }
  }

  // Parent links determine history order, even when commit clocks disagree.
  const ordered = [...nodes.values()].filter(node => !children.get(node.sha));
  for (let index = 0; index < ordered.length; index++) {
    for (const sha of ordered[index].parents) {
      const remaining = (children.get(sha) ?? 0) - 1;
      children.set(sha, remaining);
      const parent = nodes.get(sha);
      if (parent && remaining === 0) ordered.push(parent);
    }
  }

  // Malformed ancestry must not silently remove commits from the response.
  return ordered.length === nodes.size ? ordered : [...nodes.values()];
}
