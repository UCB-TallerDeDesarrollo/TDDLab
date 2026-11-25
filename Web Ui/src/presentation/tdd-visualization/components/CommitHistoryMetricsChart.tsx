import type { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

interface CommitHistoryMetricsChartProps {
  commits: CommitDataObject[];
}

const baseWidth = 1320;
const height = 560;
const left = 122;
const right = 34;
const top = 54;
const bottom = 102;

function colorForCommit(commit: CommitDataObject) {
  if (commit.coverage === undefined || commit.coverage === null) return "#111111";

  if (
    commit.test_count === 0 ||
    commit.coverage === 0 ||
    commit.conclusion === "failure"
  ) {
    return "#ff0000";
  }

  const isRefactor = /\brefactor\w*\b/i.test(commit.commit.message);
  const opacity = commit.coverage >= 90
    ? 1
    : commit.coverage >= 80
      ? 0.8
      : commit.coverage >= 70
        ? 0.6
        : commit.coverage >= 60
          ? 0.4
          : 0.2;

  return isRefactor
    ? `rgba(0, 100, 255, ${opacity})`
    : `rgba(0, 110, 0, ${opacity})`;
}

export default function CommitHistoryMetricsChart({
  commits,
}: Readonly<CommitHistoryMetricsChartProps>) {
  const orderedCommits = [...commits].sort(
    (a, b) => a.commit.date.getTime() - b.commit.date.getTime(),
  );
  if (orderedCommits.length === 0) {
    return (
      <p role="status" style={{ maxWidth: 1200, margin: "20px auto", color: "#64748B", textAlign: "center" }}>
        No hay commits disponibles para mostrar.
      </p>
    );
  }

  const testCounts = orderedCommits.map(commit => commit.test_count);
  const yMinimum = Math.min(1, ...testCounts);
  const yMaximum = Math.max(9, Math.ceil(Math.max(...testCounts)));
  const tickStep = Math.max(1, Math.ceil((yMaximum - yMinimum) / 8));
  const width = Math.max(baseWidth, orderedCommits.length * 90);
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const xFor = (index: number) =>
    orderedCommits.length === 1
      ? left + plotWidth / 2
      : left + (index * plotWidth) / (orderedCommits.length - 1);
  const yFor = (value: number) =>
    top + plotHeight - ((value - yMinimum) / (yMaximum - yMinimum)) * plotHeight;
  const barWidth = Math.max(24, Math.min(60, plotWidth / Math.max(orderedCommits.length, 1) * 0.6));
  const ticks = Array.from(
    { length: Math.floor((yMaximum - yMinimum) / tickStep) + 1 },
    (_, index) => yMinimum + index * tickStep,
  );

  return (
    <section
      aria-label="Gráfica Total Número de Tests"
      style={{
        width: "calc(100% - 70px)",
        maxWidth: width,
        margin: "12px auto 24px",
        padding: 12,
        boxSizing: "border-box",
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Total Número de Tests por commit"
          style={{ width: `${width}px`, maxWidth: "none", height: "auto", display: "block" }}
        >
          <rect x={width / 2 - 100} y="14" width="46" height="14" fill="#ff0000" />
          <text x={width / 2 - 38} y="27" fill="#666666" fontSize="14">
            Total Número de Tests
          </text>
          {ticks.map(value => {
            const y = yFor(value);
            return (
              <g key={value}>
                <line x1={left} y1={y} x2={width - right} y2={y} stroke="#d9d9d9" strokeWidth="1" />
                <text x={left - 14} y={y + 5} textAnchor="end" fill="#666666" fontSize="14">
                  {value}
                </text>
              </g>
            );
          })}
          {orderedCommits.map((commit, index) => (
            <line
              key={`commit-grid-${commit.sha}`}
              x1={xFor(index)}
              y1={top}
              x2={xFor(index)}
              y2={height - bottom}
              stroke="#d9d9d9"
              strokeWidth="1"
            />
          ))}
          {orderedCommits.map((commit, index) => {
            const x = xFor(index);
            const y = yFor(commit.test_count);
            const barHeight = height - bottom - y;
            return (
              <g key={commit.sha}>
                <title>{`Commit ${index + 1} · ${commit.test_count} tests · ${commit.sha.slice(0, 7)} · ${commit.commit.message}`}</title>
                <rect x={x - barWidth / 2} y={y} width={barWidth} height={barHeight} fill={colorForCommit(commit)} rx="4" />
              </g>
            );
          })}
          {orderedCommits.map((commit, index) => (
            <text
              key={`commit-${commit.sha}`}
              x={xFor(index)}
              y={height - 52}
              textAnchor="middle"
              fill="#666666"
              fontSize="14"
            >
              Commit {index + 1}
            </text>
          ))}
          <text x={width / 2} y={height - 10} textAnchor="middle" fill="#666666" fontSize="20">
            Commits Realizados
          </text>
          <text
            x="27"
            y={top + plotHeight / 2}
            textAnchor="middle"
            fill="#666666"
            fontSize="20"
            fontWeight="700"
            transform={`rotate(-90 27 ${top + plotHeight / 2})`}
          >
            Número de Tests
          </text>
        </svg>
      </div>
    </section>
  );
}
