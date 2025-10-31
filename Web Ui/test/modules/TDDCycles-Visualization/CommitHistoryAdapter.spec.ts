import { CommitHistoryAdapter } from "../../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";
import axios from "axios";

// Simulamos `axios` y `Octokit`
jest.mock("axios");
jest.mock("octokit");

const mockedAxios = axios as jest.Mocked<typeof axios>;
describe("CommitHistoryAdapter", () => {
  let adapter: CommitHistoryAdapter;

  beforeEach(() => {
    adapter = new CommitHistoryAdapter();
  });

  //el frontend ya no se encarga de ordenarlos de forma descendente por la fecha, ya lo recibe de esa manera desde el backend
  describe("obtainCommitsOfRepo", () => {
    it("debe retornar commits ordenados por fecha descendente", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: [
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
      expect(commits.length).toBe(2);
      expect(commits[0].sha).toBe("456"); // el más reciente
    });
  });



  describe("obtainCommitTddCycle", () => {
    it("debe retornar los ciclos TDD con cobertura", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: [
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
