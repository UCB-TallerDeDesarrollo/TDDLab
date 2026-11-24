import { CommitLog, TestExecutionLog } from "../../../../src/modules/TDDCycles/Domain/TDDLogEntry";
import { parseTDDLogs } from "../../../../src/modules/TDDCycles/Domain/parseTDDLogs";
import { FakeRepository } from "../../../../src/modules/TDDCycles/Repositories/FakeRepository";
import { fakeRichTDDRepository, fakeTDDRepository } from "../../../../src/modules/TDDCycles/Repositories/fakeTDDData";

describe("FakeRepository", () => {
  const { owner, repoName } = fakeTDDRepository;
  let repository: FakeRepository;

  beforeEach(() => {
    repository = new FakeRepository();
  });

  it("keeps executions, metrics and commit markers associated by SHA and testId", async () => {
    const commits = await repository.getCommitHistoryData(owner, repoName);
    const cycles = await repository.getCommitCyclesData(owner, repoName);
    const logs = parseTDDLogs(await repository.getTDDLogs(owner, repoName));
    const markers = logs.filter((entry): entry is CommitLog => "commitId" in entry);
    const runs = logs.filter((entry): entry is TestExecutionLog => "numPassedTests" in entry);
    const shaByTestId = new Map(markers.map((entry) => [entry.testId, entry.commitId]));

    expect(commits).toHaveLength(3);
    expect(cycles).toHaveLength(3);
    expect(runs).toHaveLength(3);
    expect(shaByTestId.size).toBe(markers.length);
    for (const run of runs) {
      const commit = commits.find(({ sha }) => sha === shaByTestId.get(run.testId));
      expect(commit?.test_count).toBe(run.numTotalTests);
      expect(commit?.conclusion).toBe(run.success ? "success" : "failure");
      expect(run.numTotalTests).toBe(run.numPassedTests + run.failedTests);
      expect(cycles.find(({ sha }) => sha === commit?.sha)?.coverage).toBe(commit?.coverage);
    }
    expect(runs).toContainEqual(expect.objectContaining({ numPassedTests: 0, failedTests: 1, success: false }));
    expect(commits.map(({ commit }) => commit.date.getTime())).toEqual(
      [...commits].map(({ commit }) => commit.date.getTime()).sort((a, b) => b - a),
    );
  });

  it("provides both branches and a merge without manufacturing executions for unmeasured commits", async () => {
    const logs = await repository.getTDDLogs(owner, repoName);
    const marker = logs.find((entry): entry is CommitLog => "commitId" in entry && entry.gitGraph !== undefined);
    const graph = marker?.gitGraph ?? [];
    const shas = new Set(graph.map(({ sha }) => sha));
    const measuredShas = new Set((await repository.getCommitHistoryData(owner, repoName)).map(({ sha }) => sha));

    expect(graph).toHaveLength(5);
    expect(graph.find(({ parents }) => parents.length === 2)?.parents).toEqual(["c".repeat(40), "d".repeat(40)]);
    expect(graph.flatMap(({ recordedBranches }) => recordedBranches ?? [])).toEqual(
      expect.arrayContaining(["descuentos", "redondeo"]),
    );
    expect(graph.every(({ parents }) => parents.every((sha) => shas.has(sha)))).toBe(true);
    expect(graph.filter(({ sha }) => !measuredShas.has(sha)).map(({ sha }) => sha)).toEqual([
      "e".repeat(40), "a".repeat(40),
    ]);
  });

  it("does not return demonstration measurements for a different repository", async () => {
    for (const [otherOwner, otherRepo] of [["student", repoName], [owner, "other"]]) {
      expect(await repository.getCommitHistoryData(otherOwner, otherRepo)).toEqual([]);
      expect(await repository.getCommitCyclesData(otherOwner, otherRepo)).toEqual([]);
      expect(await repository.getTDDLogs(otherOwner, otherRepo)).toEqual([]);
    }
  });

  it("isolates returned objects, dates and nested graph data from later requests", async () => {
    const commits = await repository.getCommitHistoryData(owner, repoName);
    const logs = await repository.getTDDLogs(owner, repoName);
    commits[0].commit.message = "modified";
    commits[0].commit.date.setUTCFullYear(1900);
    const marker = logs.find((entry): entry is CommitLog => "commitId" in entry && entry.gitGraph !== undefined);
    marker?.gitGraph?.splice(0);

    const nextCommits = await repository.getCommitHistoryData(owner, repoName);
    expect(nextCommits[0].commit.message).not.toBe("modified");
    expect(nextCommits[0].commit.date.getUTCFullYear()).toBe(2026);
    expect(await repository.getTDDLogs(owner, repoName)).toEqual(await new FakeRepository().getTDDLogs(owner, repoName));
  });

  it("provides a richer multi-branch showcase repository under tddlab-demo/branches-demo", async () => {
    const { owner: demoOwner, repoName: demoRepo } = fakeRichTDDRepository;
    const commits = await repository.getCommitHistoryData(demoOwner, demoRepo);
    const cycles = await repository.getCommitCyclesData(demoOwner, demoRepo);
    const logs = parseTDDLogs(await repository.getTDDLogs(demoOwner, demoRepo));
    const graphMarker = logs.find((entry): entry is CommitLog => "commitId" in entry && entry.gitGraph !== undefined);

    expect(commits).toHaveLength(10);
    expect(cycles).toHaveLength(10);
    expect(graphMarker?.gitGraph).toHaveLength(12);
    expect(graphMarker?.gitGraph?.flatMap(({ recordedBranches }) => recordedBranches ?? [])).toEqual(
      expect.arrayContaining(["feature/descuentos", "feature/redondeo", "feature/cupones"]),
    );
  });
});
