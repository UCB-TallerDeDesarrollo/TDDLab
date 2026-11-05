import Tooltip from '@mui/material/Tooltip';
import type { GitGraphCommit } from '../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces';

const laneColors = ['#092d4a', '#378de5', '#51758e', '#6b60a0'];
const laneX = (lane: number) => 12 + lane * 16;
const laneColor = (lane: number) => laneColors[lane % laneColors.length];

export function layoutCommits(commits: GitGraphCommit[]) {
  const visible = new Set(commits.map(({ sha }) => sha));
  const lanes: Array<string | undefined> = [];
  const childCount = new Map<string, number>();
  const vacantLane = () => {
    const vacant = lanes.indexOf(undefined);
    return vacant === -1 ? lanes.length : vacant;
  };

  const rows = commits.map((commit) => {
    const incoming = lanes.indexOf(commit.sha);
    const lane = incoming === -1 ? vacantLane() : incoming;
    const through = lanes.flatMap((sha, index) => sha && index !== lane ? [index] : []);
    lanes[lane] = undefined;

    const parents = commit.parents.filter((sha) => visible.has(sha)).map((sha, index) => {
      childCount.set(sha, (childCount.get(sha) ?? 0) + 1);
      let parentLane = lanes.indexOf(sha);
      if (parentLane === -1) {
        parentLane = index === 0 ? lane : vacantLane();
        lanes[parentLane] = sha;
      }
      return { sha, lane: parentLane };
    });

    return { commit, lane, incoming: incoming !== -1, through, parents };
  });

  return {
    rows,
    width: laneX(lanes.length - 1) + 12,
    forks: new Set([...childCount].filter(([, count]) => count > 1).map(([sha]) => sha)),
  };
}

export function getCommitBranches({ recordedBranches, historyBranch }: GitGraphCommit) {
  if (recordedBranches?.length) return recordedBranches;
  return historyBranch ? [historyBranch] : [];
}

type LaneRow = ReturnType<typeof layoutCommits>['rows'][number];

export function TDDCommitLanes({ row, width, reverse }: Readonly<{ row: LaneRow; width: number; reverse: boolean }>) {
  const x = laneX(row.lane);
  const { sha, parents } = row.commit;
  const branchLabel = getCommitBranches(row.commit).join(', ') || 'Rama no registrada';

  return (
    <div className="tdd-commit-lanes">
      <svg
        viewBox={`0 0 ${width} 100`}
        preserveAspectRatio="none"
        aria-hidden="true"
        className={reverse ? 'tdd-commit-lanes-reverse' : undefined}
      >
        {row.through.map((lane) => (
          <path key={lane} d={`M ${laneX(lane)} 0 V 100`} stroke={laneColor(lane)} />
        ))}
        {row.incoming && <path d={`M ${x} 0 V 50`} stroke={laneColor(row.lane)} />}
        {row.parents.map(({ sha, lane }) => (
          <path
            key={sha}
            d={`M ${x} 50 C ${x} 68, ${laneX(lane)} 68, ${laneX(lane)} 88 V 100`}
            stroke={laneColor(lane)}
            data-parent={sha}
          />
        ))}
      </svg>
      <Tooltip title={branchLabel} placement="right" describeChild>
        <span
          className="tdd-commit-lanes-node"
          role="img"
          aria-label={`Nodo del commit ${sha.slice(0, 7)}`}
          tabIndex={0}
          style={{ left: x, borderColor: laneColor(row.lane), backgroundColor: parents.length > 1 ? laneColor(row.lane) : '#fff' }}
        />
      </Tooltip>
    </div>
  );
}
