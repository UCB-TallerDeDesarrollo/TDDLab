import { VisualizeTDDRepository } from "../../../../src/modules/TDDCycles/Repositories/VisualizeTDDRepository";

const databaseTests = process.env.TDD_TEST_DATABASE === "true" ? describe : describe.skip;
const [owner, repoName] = (process.env.TDD_TEST_REPOSITORY ?? "").split("/");

databaseTests("VisualizeTDDRepository with a configured development database", () => {
  const repository = new VisualizeTDDRepository();

  beforeAll(() => {
    if (!owner || !repoName) throw new Error("Set TDD_TEST_REPOSITORY to owner/repo");
  });

  it("fetches commit history data from Neon DB", async () => {
    const history = await repository.getCommitHistoryData(owner, repoName);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]).toHaveProperty("sha");
    expect(history[0]).toHaveProperty("commit");
    expect(history[0]).toHaveProperty("stats");
  });

  it("fetches commit cycles data from Neon DB", async () => {
    const cycles = await repository.getCommitCyclesData(owner, repoName);
    expect(cycles.length).toBeGreaterThan(0);
    expect(cycles[0]).toHaveProperty("sha");
    expect(cycles[0]).toHaveProperty("url");
    expect(cycles[0]).toHaveProperty("tddCycle");
  });

  it("fetches TDD logs data from Neon DB", async () => {
    const logs = await repository.getTDDLogs(owner, repoName);
    expect(logs.length).toBeGreaterThan(0);
  });
});
