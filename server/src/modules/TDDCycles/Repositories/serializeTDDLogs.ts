import { parseTDDLogs } from "../Domain/parseTDDLogs";

export interface StoredTDDLog {
  id: number;
  type: "test_execution" | "commit_event";
  event_id: string | null;
  test_id: number | null;
  commit_sha: string | null;
  commit_name: string | null;
  timestamp: string;
  num_passed_tests: number | null;
  failed_tests: number | null;
  num_total_tests: number | null;
  success: boolean | null;
  git_graph: unknown;
}

function graph(value: unknown): unknown {
  return typeof value === "string" ? JSON.parse(value) : value;
}

function execution(row: StoredTDDLog, testId: number | null) {
  return {
    numPassedTests: row.num_passed_tests,
    failedTests: row.failed_tests,
    numTotalTests: row.num_total_tests,
    timestamp: Number(row.timestamp),
    success: row.success,
    testId,
  };
}

function marker(row: StoredTDDLog, testId: number | null) {
  return {
    commitId: row.commit_sha,
    commitName: row.commit_name,
    commitTimestamp: Number(row.timestamp),
    testId,
    ...(row.git_graph ? { gitGraph: graph(row.git_graph) } : {}),
  };
}

export function serializeTDDLogs(rows: StoredTDDLog[]) {
  const legacy = rows.filter((row) => !row.event_id).map((row) => row.type === "commit_event"
    ? marker(row, row.test_id) : execution(row, row.test_id));
  const commits = rows.filter((row) => row.event_id && row.type === "commit_event");
  const graphCommits = commits.flatMap((row) => {
    const value = graph(row.git_graph);
    return Array.isArray(value) ? value : [];
  });
  const runsByCommit = new Map<string, StoredTDDLog[]>();
  for (const row of rows) {
    if (row.event_id && row.type === "test_execution" && row.commit_sha) {
      const runs = runsByCommit.get(row.commit_sha) ?? [];
      runs.push(row);
      runsByCommit.set(row.commit_sha, runs);
    }
  }
  let testId = legacy.reduce((max, row) => Math.max(max, row.testId ?? 0), -1) + 1;
  const current = commits.flatMap((commit, index) => {
    const id = testId++;
    const runs = runsByCommit.get(commit.commit_sha ?? "") ?? [];
    return [
      ...runs.map((row) => execution(row, id)),
      { ...marker(commit, id), gitGraph: index === 0 ? graphCommits : undefined },
    ];
  });
  return parseTDDLogs([...legacy, ...current]);
}
