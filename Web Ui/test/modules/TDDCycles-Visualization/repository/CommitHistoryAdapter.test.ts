import { CommitHistoryAdapter } from "../../../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";
import { TDDLogEntry } from "../../../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces";

describe("CommitHistoryAdapter.obtainTDDLogs", () => {
  const adapter = new CommitHistoryAdapter("https://backend.example/api/");
  const originalFetch = globalThis.fetch;
  const fetchMock = jest.fn();
  const errorMessage = "No se pudieron cargar los datos TDD desde el servidor.";

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("devuelve las ejecuciones y marcadores que devuelve el backend", async () => {
    const logs: TDDLogEntry[] = [
      { testId: 1, timestamp: 1000, numPassedTests: 1, failedTests: 0, numTotalTests: 1, success: true },
      { testId: 1, commitId: "abc", commitName: "feat: test", commitTimestamp: 2000 },
    ];
    fetchMock.mockResolvedValue({ ok: true, json: async () => logs });

    await expect(adapter.obtainTDDLogs("test-owner", "test-repo")).resolves.toEqual(logs);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example/api/TDDCycles/test-log?owner=test-owner&repoName=test-repo",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("devuelve un error controlado si el backend responde con error", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 502 });
    await expect(adapter.obtainTDDLogs("owner", "repo")).rejects.toThrow(errorMessage);
  });

  it("devuelve un error controlado si falla la red", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(adapter.obtainTDDLogs("owner", "repo")).rejects.toThrow(errorMessage);
  });

  it("carga divisor en una sola petición y convierte las fechas", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({
      commits: [{ sha: "abc", commit: { date: "2026-11-26T22:06:35.000Z" } }],
      commitsTddCycles: [], tddLogs: [],
    }) });
    const data = await adapter.obtainVisualization("RashLop", "repo", "feature/divisor");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://backend.example/api/TDDCycles/visualization?owner=RashLop&repoName=repo&branch=feature%2Fdivisor");
    expect(data.commits[0].commit.date).toEqual(new Date("2026-11-26T22:06:35.000Z"));
  });

  it("interrumpe la consulta si el backend no responde", async () => {
    jest.useFakeTimers();
    try {
      fetchMock.mockImplementation((_url, { signal }: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(new Error("Aborted")));
        }),
      );

      const result = expect(adapter.obtainTDDLogs("owner", "repo")).rejects.toThrow(errorMessage);
      jest.advanceTimersByTime(10000);
      await result;
    } finally {
      jest.useRealTimers();
    }
  });
});
