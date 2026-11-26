import { VisualizeTDDRepository } from "../../../../src/modules/TDDCycles/Repositories/VisualizeTDDRepository";
import { Pool } from "pg";

describe("VisualizeTDDRepository", () => {
  let mockClient: any;
  let mockPool: any;
  let repository: VisualizeTDDRepository;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    };
    repository = new VisualizeTDDRepository(mockPool as unknown as Pool);
  });

  describe("getCommitHistoryData", () => {
    it("should return formatted commit history from database", async () => {
      const mockRows = [
        {
          owner: "testowner",
          reponame: "testrepo",
          html_url: "https://github.com/ChristopherQuiroz/Totalizador-de-Venta",
          sha: "sha1",
          total: 10,
          additions: 7,
          deletions: 3,
          message: "feat: add feature",
          url: "https://github.com/ChristopherQuiroz/Totalizador-de-Venta",
          comment_count: 2,
          commit_date: new Date("2026-01-01T12:00:00Z"),
          coverage: "85.5",
          test_count: 15,
          conclusion: "success",
        },
      ];
      mockClient.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await repository.getCommitHistoryData("testowner", "testrepo");

      expect(mockClient.query).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        html_url: "https://github.com/ChristopherQuiroz/Totalizador-de-Venta",
        sha: "sha1",
        stats: {
          total: 10,
          additions: 7,
          deletions: 3,
          date: new Date("2026-01-01T12:00:00Z").toISOString(),
        },
        commit: {
          date: new Date("2026-01-01T12:00:00Z"),
          message: "feat: add feature",
          url: "https://github.com/ChristopherQuiroz/Totalizador-de-Venta",
          comment_count: 2,
        },
        coverage: 85.5,
        test_count: 15,
        conclusion: "success",
      });
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
  });

  describe("getCommitCyclesData", () => {
    it("should return mapped commit cycles data from database", async () => {
      const mockRows = [
        {
          url: "https://github.com/ChristopherQuiroz/Totalizador-de-Venta",
          sha: "sha1",
          tdd_cycle: "RojoVerde",
          coverage: "90",
        },
      ];
      mockClient.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await repository.getCommitCyclesData("testowner", "testrepo");

      expect(result).toEqual([
        {
          url: "https://github.com/ChristopherQuiroz/Totalizador-de-Venta",
          sha: "sha1",
          tddCycle: "RojoVerde",
          coverage: 90,
        },
      ]);
    });
  });

  describe("getTDDLogs", () => {
    it("should return test execution and commit log entries from database", async () => {
      const mockRows = [
        {
          type: "test_execution",
          test_id: 1,
          num_passed_tests: 5,
          failed_tests: 0,
          num_total_tests: 5,
          timestamp: 1600000000000,
          success: true,
        },
        {
          type: "commit_event",
          test_id: 1,
          commit_sha: "sha123",
          commit_name: "Initial commit",
          timestamp: 1600000005000,
          git_graph: JSON.stringify([{ sha: "sha123", parents: [] }]),
        },
      ];
      mockClient.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await repository.getTDDLogs("testowner", "testrepo");

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        testId: 1,
        numPassedTests: 5,
        failedTests: 0,
        numTotalTests: 5,
        timestamp: 1600000000000,
        success: true,
      });
      expect(result[1]).toEqual({
        testId: 1,
        commitId: "sha123",
        commitName: "Initial commit",
        commitTimestamp: 1600000005000,
        gitGraph: [{ sha: "sha123", parents: [] }],
      });
    });
  });

  describe("saveTDDLogs", () => {
    it("should insert log entries in a transaction", async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const logs = [
        {
          numPassedTests: 3,
          failedTests: 1,
          numTotalTests: 4,
          timestamp: 1600000000000,
          success: false,
          testId: 1,
        },
        {
          commitId: "sha999",
          commitName: "fix tests",
          commitTimestamp: 1600000010000,
          testId: 1,
        },
      ];

      await repository.saveTDDLogs("testowner", "testrepo", logs);

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
