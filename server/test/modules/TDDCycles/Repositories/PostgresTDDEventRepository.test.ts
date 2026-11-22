import { PostgresTDDEventRepository } from "../../../../src/modules/TDDCycles/Repositories/PostgresTDDEventRepository";

describe("PostgresTDDEventRepository", () => {
  const client = { query: jest.fn(), release: jest.fn() };
  const pool = { connect: jest.fn() };
  const batch = { owner: "example", repoName: "exercise", executions: [], commits: [] };
  const executions = ["a", "b", "c"].map(letter => ({
    eventId: `${letter.repeat(8)}-${letter.repeat(4)}-4${letter.repeat(3)}-8${letter.repeat(3)}-${letter.repeat(12)}`,
    timestamp: 1_790_000_000_000, numPassedTests: 1, failedTests: 0,
    numTotalTests: 1, success: true, coverage: 100,
  }));

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

  it("waits for each execution before writing the next and committing", async () => {
    let finishFirst = () => {};
    const pending = new Promise<{ rows: { id: number }[] }>(resolve => {
      finishFirst = () => resolve({ rows: [{ id: 1 }] });
    });
    client.query.mockImplementation((_sql: string, values?: unknown[]) => {
      if (values?.[2] === executions[0].eventId) return pending;
      return Promise.resolve({ rows: [{ id: 1 }] });
    });
    const saving = new PostgresTDDEventRepository(pool).saveEvents({ ...batch, executions });
    await new Promise<void>(resolve => setImmediate(resolve));
    const writtenIds = () => client.query.mock.calls
      .filter(([sql]) => sql.includes("INSERT INTO tdd_logs"))
      .map(([, values]) => values[2]);
    expect(writtenIds()).toEqual([executions[0].eventId]);
    expect(client.query).not.toHaveBeenCalledWith("COMMIT");

    finishFirst();
    await saving;
    expect(writtenIds()).toEqual(executions.map(run => run.eventId));
    expect(client.query).toHaveBeenLastCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it("stops writing the batch when an execution fails", async () => {
    const failure = new Error("Execution could not be saved");
    client.query.mockImplementation((_sql: string, values?: unknown[]) => {
      if (values?.[2] === executions[1].eventId) return Promise.reject(failure);
      return Promise.resolve({ rows: [{ id: 1 }] });
    });
    await expect(new PostgresTDDEventRepository(pool).saveEvents({ ...batch, executions }))
      .rejects.toThrow(failure);
    const writtenIds = client.query.mock.calls
      .filter(([sql]) => sql.includes("INSERT INTO tdd_logs"))
      .map(([, values]) => values[2]);
    expect(writtenIds).toEqual(executions.slice(0, 2).map(run => run.eventId));
    expect(client.query).toHaveBeenLastCalledWith("ROLLBACK");
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
