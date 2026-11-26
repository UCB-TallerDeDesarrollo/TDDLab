import { VisualizeTDDRepository } from "../../../../src/modules/TDDCycles/Repositories/VisualizeTDDRepository";

describe("VisualizeTDDRepository", () => {
  const client = { query: jest.fn(), release: jest.fn() };
  const pool = { connect: jest.fn().mockResolvedValue(client) };
  const repository = new VisualizeTDDRepository(pool);

  beforeEach(() => jest.clearAllMocks());

  it("returns the stored date, test result and complete modification count", async () => {
    const date = new Date("2026-11-25T12:00:00Z");
    client.query.mockResolvedValueOnce({ rows: [{
      html_url: "https://github.com/example/exercise/commit/abc", sha: "abc", total: 117,
      additions: 116, deletions: 1, message: "test: registrar fallo", url: "", comment_count: 0,
      commit_date: date, coverage: "0", test_count: 1, conclusion: "failure",
    }] });
    const [commit] = await repository.getCommitHistoryData("Example", "Exercise");
    expect(commit).toMatchObject({
      sha: "abc", stats: { total: 117, additions: 116, deletions: 1, date: date.toISOString() },
      commit: { date, message: "test: registrar fallo" }, coverage: 0, test_count: 1, conclusion: "failure",
    });
    expect(client.query).toHaveBeenCalledWith(expect.any(String), ["Example", "Exercise"]);
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it.each([null, ""])("keeps unknown coverage %p distinct from zero", async (coverage) => {
    client.query.mockResolvedValueOnce({ rows: [{ sha: "abc", commit_date: new Date(), coverage, test_count: 1 }] });
    expect((await repository.getCommitHistoryData("example", "exercise"))[0].coverage).toBeNull();
  });

  it("returns cycle classifications without substituting missing coverage", async () => {
    client.query.mockResolvedValueOnce({ rows: [
      { url: "", sha: "abc", tdd_cycle: "RojoVerde", coverage: "0" },
      { url: "", sha: "def", tdd_cycle: null, coverage: null },
    ] });
    expect(await repository.getCommitCyclesData("example", "exercise")).toEqual([
      { url: "", sha: "abc", tddCycle: "RojoVerde", coverage: 0 },
      { url: "", sha: "def", tddCycle: "null", coverage: null },
    ]);
  });

  it("does not invent a current date for an undated commit", async () => {
    client.query.mockResolvedValueOnce({ rows: [{ commit_date: null }] });
    await expect(repository.getCommitHistoryData("example", "exercise")).rejects.toThrow("missing its date");
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it("releases the connection when reading logs fails", async () => {
    client.query.mockRejectedValueOnce(new Error("database unavailable"));
    await expect(repository.getTDDLogs("example", "exercise")).rejects.toThrow("database unavailable");
    expect(client.release).toHaveBeenCalledTimes(1);
  });
});
