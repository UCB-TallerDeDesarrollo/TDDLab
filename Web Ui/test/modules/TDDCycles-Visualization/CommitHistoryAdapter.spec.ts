import { CommitHistoryAdapter } from "../../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";

jest.mock("octokit");

const originalFetch = globalThis.fetch;
const fetchMock = jest.fn();
describe("CommitHistoryAdapter", () => {
  let adapter: CommitHistoryAdapter;

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
    adapter = new CommitHistoryAdapter("https://backend.example/api");
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  //el frontend ya no se encarga de ordenarlos de forma descendente por la fecha, ya lo recibe de esa manera desde el backend
  describe("obtainCommitsOfRepo", () => {
    it("debe retornar commits ordenados por fecha descendente", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            sha: "456",
            stats: { total: 15, additions: 10, deletions: 5, date: "2024-01-02" },
            commit: {
              date: "2024-01-02",
              message: "Test",
              url: "url2",
              comment_count: 0,
            },
            coverage: 90,
            test_count: 3,
            conclusion: "success"
          },
          {
            sha: "123",
            stats: { total: 10, additions: 5, deletions: 5, date: "2024-01-01" },
            commit: {
              date: "2024-01-01",
              message: "Init",
              url: "url1",
              comment_count: 0,
            },
            coverage: 80,
            test_count: 2,
            conclusion: "success"
          }
        ]
      });

      const commits = await adapter.obtainCommitsOfRepo("owner", "repo");
      expect(fetchMock).toHaveBeenCalledWith(
        "https://backend.example/api/TDDCycles/commits-history?owner=owner&repoName=repo",
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(commits[0].commit.date).toEqual(new Date("2024-01-02"));
      expect(commits.length).toBe(2);
      expect(commits[0].sha).toBe("456"); // el más reciente
    });
  });



  describe("obtainCommitTddCycle", () => {
    it("debe retornar los ciclos TDD con cobertura", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            sha: "789",
            url: "url3",
            tddCycle: "Red-Green-Refactor",
            coverage: 75
          }
        ]
      });

      const cycles = await adapter.obtainCommitTddCycle("owner", "repo");
      expect(cycles).toEqual([
        {
          sha: "789",
          url: "url3",
          tddCycle: "Red-Green-Refactor",
          coverage: 75
        }
      ]);
    });
  });
});
