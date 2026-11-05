import type { GitGraphCommit } from './TDDLogInterfaces';
import type { CommitDataObject } from './githubCommitInterfaces';

export function getCommitNumbers(commits: CommitDataObject[], gitGraph: GitGraphCommit[] = []) {
  const graphShas = new Set(gitGraph.map(({ sha }) => sha));
  const older = commits
    .filter(({ sha }) => !graphShas.has(sha))
    .sort((a, b) => new Date(a.commit.date).getTime() - new Date(b.commit.date).getTime() || a.sha.localeCompare(b.sha));
  const history = [...older, ...[...gitGraph].reverse()];

  return new Map(history.map(({ sha }, index) => [sha, index + 1]));
}
