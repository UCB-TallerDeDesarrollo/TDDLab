import axios from "axios";
import { CommitHistoryAdapter } from "../../../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";
import { TDDLogEntry } from "../../../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import { VITE_API } from "../../../../config";
import { CommitDataObject } from "../../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("CommitHistoryAdapter", () => {
  let adapter: CommitHistoryAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new CommitHistoryAdapter();
  });

  describe("obtainTDDLogs", () => {
    it("should fetch and return TDD log data successfully", async () => {
      const owner = "test-owner";
      const repoName = "test-repo";

      const expectedUrl =
        `https://raw.githubusercontent.com/${owner}/${repoName}/main/script/tdd_log.json`;

      const mockTDDLogData: TDDLogEntry[] = [
        {
          numPassedTests: 1,
          failedTests: 0,
          numTotalTests: 1,
          timestamp: 1758766676204,
          success: true,
          testId: 3,
        },
        {
          numPassedTests: 1,
          failedTests: 0,
          numTotalTests: 1,
          timestamp: 1758766687146,
          success: true,
          testId: 3,
        },
        {
          commitId: "469f032eaca7dd35477537de97bea886c8d74327",
          commitName: "asociates tests to commit",
          commitTimestamp: 1758766975723,
          testId: 3,
        },
        {
          numPassedTests: 1,
          failedTests: 0,
          numTotalTests: 1,
          timestamp: 1758767003612,
          success: true,
          testId: 4,
        },
        {
          commitId: "f00370bc4a0ecfe8e42cb79957f837c1604f9fa9",
          commitName: "deleting unused lines",
          commitTimestamp: 1758768425840,
          testId: 4,
        },
        {
          numPassedTests: 1,
          failedTests: 0,
          numTotalTests: 1,
          timestamp: 1758768446457,
          success: true,
          testId: 5,
        },
      ];

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockTDDLogData,
      });

      const result = await adapter.obtainTDDLogs(owner, repoName);

      expect(mockedAxios.get).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockTDDLogData);
    });

    it("should throw an error if the network request fails", async () => {
      const owner = "test-owner";
      const repoName = "test-repo";

      mockedAxios.get.mockRejectedValue(new Error("Network error"));

      await expect(
        adapter.obtainTDDLogs(owner, repoName),
      ).rejects.toThrow("Network error");
    });

    it("should return an empty array if tdd_log.json is not found", async () => {
      const owner = "test-owner";
      const repoName = "test-repo";

      const error = {
        response: {
          status: 404,
        },
      };

      mockedAxios.get.mockRejectedValue(error);

      await expect(
        adapter.obtainTDDLogs(owner, repoName),
      ).resolves.toEqual([]);
    });
  });

  describe("obtainCommitTddCycle", () => {
    it("should return the TDD cycles received from the backend", async () => {
      const owner = "owner";
      const repoName = "repo";

      const mockData = [
        {
          sha: "789",
          url: "url3",
          tddCycle: "Red-Green-Refactor",
          coverage: 75,
        },
      ];

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockData,
      });

      const cycles = await adapter.obtainCommitTddCycle(
        owner,
        repoName,
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${VITE_API}/TDDCycles/commit-cycles`,
        {
          params: {
            owner,
            repoName,
          },
        },
      );

      expect(cycles).toEqual([
        {
          sha: "789",
          url: "url3",
          tddCycle: "Red-Green-Refactor",
        },
      ]);
    });
  });

  describe("obtainCommitsOfRepo", () => {
    it("should return commits received from the backend with dates converted to Date", async () => {
      const owner = "owner";
      const repoName = "repo";

      const mockData: CommitDataObject[] = [
        {
          sha: "abc123",
          commit: {
            message: "test commit",
            date: "2026-09-24T10:00:00.000Z",
          },
        } as unknown as CommitDataObject,
      ];

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockData,
      });

      const commits = await adapter.obtainCommitsOfRepo(
        owner,
        repoName,
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${VITE_API}/TDDCycles/commits-history`,
        {
          params: {
            owner,
            repoName,
          },
        },
      );

      expect(commits).toHaveLength(1);
      expect(commits[0].sha).toBe("abc123");
      expect(commits[0].commit.date).toEqual(
        new Date("2026-09-24T10:00:00.000Z"),
      );
    });
  });
});