import { InvalidTDDEventsError, parseTDDEvents } from "../../../../src/modules/TDDCycles/Domain/parseTDDEvents";

describe("parseTDDEvents", () => {
  const eventId = "abcdefab-cdef-4abc-8def-abcdefabcdef";
  const execution = {
    eventId, branch: "feature/CaseSensitive", timestamp: 1_790_000_000_000,
    numPassedTests: 0, failedTests: 1, numTotalTests: 1, success: false, coverage: null,
  };
  const commit = {
    sha: "a".repeat(40), parents: ["b".repeat(40)], message: "test: preserve identity",
    timestamp: 1_790_000_001_000, executionIds: [eventId],
    stats: { total: 0, additions: 0, deletions: 0 },
  };
  const batch = { owner: "Example", repoName: "Exercise", executions: [execution], commits: [commit] };

  it("normalizes identifiers without changing branch names or the input", () => {
    const input = {
      ...batch,
      executions: [{ ...execution, eventId: eventId.toUpperCase() }],
      commits: [{ ...commit, sha: commit.sha.toUpperCase(),
        parents: commit.parents.map(parent => parent.toUpperCase()), executionIds: [eventId.toUpperCase()] }],
    };
    const parsed = parseTDDEvents(input);
    expect(parsed).toEqual({ ...batch, owner: "example", repoName: "exercise" });
    expect(input.executions[0].eventId).toBe(eventId.toUpperCase());
    expect(input.commits[0].sha).toBe(commit.sha.toUpperCase());
  });

  it("rejects repeated execution references with different letter case", () => {
    expect(() => parseTDDEvents({
      ...batch, commits: [{ ...commit, executionIds: [eventId, eventId.toUpperCase()] }],
    })).toThrow(InvalidTDDEventsError);
  });

  it("preserves false, zero and unknown coverage", () => {
    expect(parseTDDEvents(batch).executions[0]).toEqual(execution);
  });

  it("normalizes the rewrite receipt and original SHAs", () => {
    const rewrite = { id: eventId.toUpperCase(), from: ["C".repeat(40), "B".repeat(40)] };
    const parsed = parseTDDEvents({ ...batch, commits: [{ ...commit, rewrite }] });
    expect(parsed.commits[0].rewrite).toEqual({ id: eventId, from: ["b".repeat(40), "c".repeat(40)] });
    expect(rewrite.from[0]).toBe("C".repeat(40));
  });

  it.each([
    { id: "invalid", from: ["b".repeat(40)] },
    { id: eventId, from: [] },
    { id: eventId, from: ["b".repeat(40), "B".repeat(40)] },
    { id: eventId, from: ["A".repeat(40)] },
    { id: eventId, from: ["not-a-commit"] },
  ])("rejects invalid or ambiguous rewrite descriptors", rewrite => {
    expect(() => parseTDDEvents({ ...batch, commits: [{ ...commit, rewrite }] })).toThrow(InvalidTDDEventsError);
  });
});
