import { PostgresTDDEventRepository } from "../../../../src/modules/TDDCycles/Repositories/PostgresTDDEventRepository";

describe("PostgresTDDEventRepository", () => {
  const client = { query: jest.fn(), release: jest.fn() };
  const pool = { connect: jest.fn() };
  const batch = { owner: "example", repoName: "exercise", executions: [], commits: [] };

  beforeEach(() => {
    client.query.mockReset().mockResolvedValue({ rows: [] });
    client.release.mockReset();
    pool.connect.mockReset().mockResolvedValue(client);
  });

  it("commits the batch and releases the connection", async () => {
    await new PostgresTDDEventRepository(pool).saveEvents(batch);
    expect(client.query).toHaveBeenCalledWith("BEGIN");
    expect(client.query).toHaveBeenCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it("rolls back the batch and releases the connection after a storage error", async () => {
    const failure = new Error("Storage unavailable");
    client.query.mockResolvedValueOnce({ rows: [] }).mockRejectedValueOnce(failure);
    await expect(new PostgresTDDEventRepository(pool).saveEvents(batch)).rejects.toThrow(failure);
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.query).not.toHaveBeenCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it("propagates a connection failure without starting a transaction", async () => {
    const failure = new Error("Connection unavailable");
    pool.connect.mockRejectedValueOnce(failure);
    await expect(new PostgresTDDEventRepository(pool).saveEvents(batch)).rejects.toThrow(failure);
    expect(client.query).not.toHaveBeenCalled();
  });
});
