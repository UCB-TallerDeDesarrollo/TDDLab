import { serializeTDDLogs, StoredTDDLog } from "../../../../src/modules/TDDCycles/Repositories/serializeTDDLogs";

const left = "a".repeat(40);
const right = "b".repeat(40);
const merged = "c".repeat(40);

function row(overrides: Partial<StoredTDDLog>): StoredTDDLog {
  return {
    id: 1, type: "test_execution", event_id: "run-1", test_id: null,
    commit_sha: left, commit_name: null, timestamp: "1000", num_passed_tests: 0,
    failed_tests: 1, num_total_tests: 1, success: false, git_graph: null,
    ...overrides,
  };
}

function commit(sha: string, parents: string[] = []): StoredTDDLog {
  return row({
    type: "commit_event", event_id: `commit:${sha}`, commit_sha: sha,
    commit_name: "test: registrar ciclo", timestamp: "2000",
    git_graph: [{ sha, parents, subject: "test: registrar ciclo" }],
  });
}

describe("serializeTDDLogs", () => {
  it("keeps UUID executions with a commit SHA as executions, including zero passed tests", () => {
    const logs = serializeTDDLogs([row({}), commit(left)]);
    expect(logs).toHaveLength(2);
    expect(logs[0]).toMatchObject({ numPassedTests: 0, failedTests: 1, success: false });
    expect(logs[1]).toMatchObject({ commitId: left, testId: logs[0].testId });
  });

  it("links parallel branch cycles by SHA without mixing their results", () => {
    const logs = serializeTDDLogs([
      row({}), row({ event_id: "run-2", commit_sha: right, success: true, failed_tests: 0, num_passed_tests: 1 }),
      row({ event_id: "run-3", timestamp: "1500", success: true, failed_tests: 0, num_passed_tests: 1 }),
      commit(left), commit(right),
    ]);
    const markers = logs.filter((log) => "commitId" in log);
    expect(markers[0].testId).not.toBe(markers[1].testId);
    expect(logs.filter((log) => log.testId === markers[0].testId)).toEqual([
      expect.objectContaining({ success: false }),
      expect.objectContaining({ success: true }),
      expect.objectContaining({ commitId: left }),
    ]);
    expect(logs.filter((log) => log.testId === markers[1].testId)).toEqual([
      expect.objectContaining({ success: true }), expect.objectContaining({ commitId: right }),
    ]);
  });

  it("includes unmeasured merges as Git context without inventing test executions", () => {
    const logs = serializeTDDLogs([commit(left), commit(right), commit(merged, [left, right])]);
    expect(logs).toHaveLength(3);
    expect(logs.every((log) => "commitId" in log)).toBe(true);
    const graph = logs.flatMap((log) => "commitId" in log ? log.gitGraph ?? [] : []);
    expect(graph).toHaveLength(3);
    expect(graph.find((node) => node.sha === merged)?.parents).toEqual([left, right]);
  });

  it("preserves legacy IDs and reserves distinct IDs for new cycles", () => {
    const legacyRun = row({ event_id: null, test_id: 4, commit_sha: null });
    const legacyCommit = row({ ...commit(left), event_id: null, test_id: 4 });
    const logs = serializeTDDLogs([legacyRun, legacyCommit, row({ commit_sha: right }), commit(right)]);
    expect(logs.slice(0, 2).map((log) => log.testId)).toEqual([4, 4]);
    expect(logs[2].testId).toBeGreaterThan(4);
    expect(logs[3]).toMatchObject({ commitId: right, testId: logs[2].testId });
  });

  it("leaves pending UUID executions out until they are associated with a commit", () => {
    expect(serializeTDDLogs([row({ commit_sha: null })])).toEqual([]);
  });

  it("keeps an ancestor of a rewritten commit as context without assigning it the moved executions", () => {
    const logs = serializeTDDLogs([
      commit(left), row({ commit_sha: right }), commit(right, [left]),
    ]);
    const original = logs.find((log) => "commitId" in log && log.commitId === left);
    const rewritten = logs.find((log) => "commitId" in log && log.commitId === right);
    expect(logs.filter((log) => log.testId === original?.testId)).toHaveLength(1);
    expect(logs.filter((log) => log.testId === rewritten?.testId)).toEqual([
      expect.objectContaining({ success: false }), expect.objectContaining({ commitId: right }),
    ]);
  });

  it("rejects malformed execution counts instead of fabricating successful runs", () => {
    expect(() => serializeTDDLogs([row({ num_total_tests: null }), commit(left)])).toThrow();
  });
});
