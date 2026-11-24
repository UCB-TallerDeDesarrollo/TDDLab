import { Pool } from "pg";
import { DBJobsRepository } from "../../../../src/modules/TDDCycles/Repositories/DBJobsRepository";

const result = { sha: "abc123", owner: "demo", reponame: "tests", conclusion: "success" } as const;

describe("DBJobsRepository registration persistence", () => {
  let query: jest.Mock;
  let release: jest.Mock;
  let repository: DBJobsRepository;

  beforeEach(() => {
    query = jest.fn();
    release = jest.fn();
    const pool = { connect: jest.fn().mockResolvedValue({ query, release }) } as unknown as Pool;
    repository = new DBJobsRepository(pool);
  });

  it("writes a new result with INSERT and reports created", async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    await expect(repository.register(result)).resolves.toBe("created");
    expect(query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO jobstable"), ["abc123", "demo", "tests", "success"]);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("reads the persisted conclusion after a unique-key collision", async () => {
    query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ conclusion: "success" }] });

    await expect(repository.register(result)).resolves.toBe("duplicate");
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining("SELECT conclusion FROM jobstable"), ["abc123", "demo", "tests"]);
  });

  it("reports conflict when an existing result has another conclusion", async () => {
    query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ conclusion: "failure" }] });

    await expect(repository.register(result)).resolves.toBe("conflict");
  });

  it("reads results with SELECT scoped to owner and repository", async () => {
    const stored = { id: 1, ...result };
    query.mockResolvedValueOnce({ rows: [stored] });

    await expect(repository.getJobs("demo", "tests")).resolves.toEqual([stored]);
    expect(query).toHaveBeenCalledWith(expect.stringContaining("SELECT id, sha, owner, reponame, conclusion"), ["demo", "tests"]);
  });

  it("releases the client when PostgreSQL rejects the INSERT", async () => {
    query.mockRejectedValueOnce(new Error("database unavailable"));

    await expect(repository.register(result)).rejects.toThrow("database unavailable");
    expect(release).toHaveBeenCalledTimes(1);
  });
});
