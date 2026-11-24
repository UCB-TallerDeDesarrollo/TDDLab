import type {
  BranchHistories,
  BranchHistoryCommit,
} from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";

interface BranchHistoryChartProps {
  history: BranchHistories;
}

const width = 1320;
const height = 620;
const left = 150;
const right = 70;
const top = 35;
const bottom = 86;

const branchColors: Record<string, string> = {
  main: "#1E40AF",
  "rama-a": "#0D9488",
  "rama-b": "#2563EB",
  "rama-c": "#7C3AED",
  "rama-d": "#D97706",
  "rama-feature": "#DB2777",
};
const fallbackColors = ["#0891B2", "#4F46E5", "#C026D3", "#EA580C", "#16A34A"];

function shortSha(commit: BranchHistoryCommit) {
  return commit.sha.slice(0, 7);
}

export default function BranchHistoryChart({ history }: Readonly<BranchHistoryChartProps>) {
  const branches = history.branches.filter(branch => branch.commits.length > 0);
  const commitsBySha = new Map<string, BranchHistoryCommit>();
  branches.forEach(branch => {
    branch.commits.forEach(commit => commitsBySha.set(commit.sha, commit));
  });

  const orderedCommits = Array.from(commitsBySha.values()).sort((a, b) => {
    if (!a.committedAt || !b.committedAt) return 0;
    return a.committedAt.getTime() - b.committedAt.getTime();
  });
  const executions = branches.flatMap(branch => branch.executions);
  const testCountFor = (commit: BranchHistoryCommit) => {
    if (commit.metrics?.numTotalTests != null) return commit.metrics.numTotalTests;
    const execution = executions
      .filter(item => item.associatedCommitSha === commit.sha)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    return execution?.numTotalTests ?? 0;
  };

  if (branches.length === 0 || orderedCommits.length === 0) return null;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const commitIndex = new Map(orderedCommits.map((commit, index) => [commit.sha, index]));
  const xForIndex = (index: number) =>
    orderedCommits.length === 1
      ? left + plotWidth / 2
      : left + (index * plotWidth) / (orderedCommits.length - 1);
  const yMinimum = 1;
  const yMaximum = Math.max(5, ...branches.flatMap(branch =>
    branch.commits.map(commit => testCountFor(commit)),
  ));
  const yFor = (value: number) =>
    top + ((yMaximum - value) * plotHeight) / Math.max(yMaximum - yMinimum, 1);

  const colorFor = (branchName: string, index: number) =>
    branchColors[branchName] ?? fallbackColors[index % fallbackColors.length];

  const smoothPath = (points: Array<{ sha: string; value: number }>) => {
    if (points.length === 0) return "";
    const firstIndex = commitIndex.get(points[0].sha) ?? 0;
    let path = `M ${xForIndex(firstIndex)} ${yFor(points[0].value)}`;
    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const current = points[index];
      const previousIndex = commitIndex.get(previous.sha) ?? 0;
      const currentIndex = commitIndex.get(current.sha) ?? previousIndex;
      const previousX = xForIndex(previousIndex);
      const currentX = xForIndex(currentIndex);
      const previousY = yFor(previous.value);
      const currentY = yFor(current.value);
      const controlOffset = (currentX - previousX) * 0.45;
      path += ` C ${previousX + controlOffset} ${previousY}, ${currentX - controlOffset} ${currentY}, ${currentX} ${currentY}`;
    }
    return path;
  };

  const yTicks = Array.from({ length: 9 }, (_, index) => yMinimum + index * 0.5)
    .filter(value => value <= yMaximum);

  return (
    <section
      aria-label="Historial de commits por ramas"
      style={{
        width: "calc(100% - 70px)",
        maxWidth: width,
        margin: "8px auto",
        padding: "12px",
        boxSizing: "border-box",
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div aria-label="Leyenda de ramas" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "18px", minHeight: 34, marginBottom: 4 }}>
        {branches.map((branch, index) => (
          <div key={branch.branch} style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", fontSize: 14, fontWeight: 700 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: colorFor(branch.branch, index), display: "inline-block" }} />
            {branch.branch}
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Grafo de ramas y commits" style={{ width: "100%", height: "auto", background: "#fff", display: "block" }}>
        {yTicks.map(value => {
          const y = yFor(value);
          return (
            <g key={value}>
              <line x1={left} y1={y} x2={width - right} y2={y} stroke="#E5E7EB" strokeWidth="1" />
              <text x={left - 22} y={y + 5} textAnchor="end" fill="#64748B" fontSize="16" fontWeight="600">
                {value.toFixed(1).replace(".", ",")}
              </text>
            </g>
          );
        })}
        {orderedCommits.map((commit, index) => {
          const x = xForIndex(index);
          return (
            <line key={`graph-column-${commit.sha}`} x1={x} y1={top} x2={x} y2={height - bottom} stroke="#EEF2F7" strokeWidth="1" />
          );
        })}

        {branches.map((branch, branchIndex) => {
          const branchCommits = branch.commits
            .filter(commit => commitIndex.has(commit.sha))
            .sort((a, b) => (commitIndex.get(a.sha) ?? 0) - (commitIndex.get(b.sha) ?? 0))
            .map(commit => ({ sha: commit.sha, value: testCountFor(commit) }));
          return (
            <path
              key={`${branch.branch}-line`}
              d={smoothPath(branchCommits)}
              fill="none"
              stroke={colorFor(branch.branch, branchIndex)}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {branches.map((branch, branchIndex) =>
          branch.commits.map(commit => {
            const commitPosition = commitIndex.get(commit.sha);
            if (commitPosition == null) return null;
            const value = testCountFor(commit);
            const x = xForIndex(commitPosition);
            const y = yFor(value);
            const color = colorFor(branch.branch, branchIndex);
            return (
              <g key={`${branch.branch}-${commit.sha}`} role="img">
                <title>{`${branch.branch} · Commit ${commitPosition + 1} · ${value} tests · ${shortSha(commit)}`}</title>
                <circle cx={x} cy={y} r="19" fill={color} stroke="#fff" strokeWidth="3" />
                <text x={x} y={y + 6} textAnchor="middle" fill="#fff" fontSize="16" fontWeight="800">
                  {value}
                </text>
              </g>
            );
          }),
        )}

        {orderedCommits.map((commit, index) => (
          <text key={`commit-label-${commit.sha}`} x={xForIndex(index)} y={height - 48} textAnchor="middle" fill="#475569" fontSize="15" fontWeight="700">
            Commit {index + 1}
          </text>
        ))}
        <text x={width / 2} y={height - 10} textAnchor="middle" fill="#334155" fontSize="17" fontWeight="700">
          Commits Realizados
        </text>
        <text x="28" y={top + plotHeight / 2} textAnchor="middle" fill="#334155" fontSize="17" fontWeight="700" transform={`rotate(-90 28 ${top + plotHeight / 2})`}>
          Número de Tests
        </text>
      </svg>
    </section>
  );
}
