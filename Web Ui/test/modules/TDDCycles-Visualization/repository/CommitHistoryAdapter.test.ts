import axios from 'axios';
import { CommitHistoryAdapter } from '../../../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter';
import { TDDLogEntry } from '../../../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces';

// Mocking the axios library
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CommitHistoryAdapter', () => {
  let adapter: CommitHistoryAdapter;

  beforeEach(() => {
    adapter = new CommitHistoryAdapter();
    mockedAxios.get.mockClear();
  });

  describe('obtainDefaultBranch', () => {
    it('should return the repository default branch', async () => {
      const requestSpy = jest.spyOn(adapter.octokit, 'request').mockResolvedValue({
        status: 200,
        data: { default_branch: 'master' },
      } as any);

      await expect(adapter.obtainDefaultBranch('test-owner', 'test-repo')).resolves.toBe('master');
      expect(requestSpy).toHaveBeenCalledWith('GET /repos/{owner}/{repo}', {
        owner: 'test-owner',
        repo: 'test-repo',
      });
    });
  });

  describe('obtainTDDLogs', () => {
    it('should fetch and return TDD log data from the provided branch', async () => {
      // Arrange
      const owner = 'test-owner';
      const repoName = 'test-repo';
      const branch = 'master';
      const expectedUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/script/tdd_log.json`;

      const mockTDDLogData: TDDLogEntry[] = [
        {
          "numPassedTests": 1,
          "failedTests": 0,
          "numTotalTests": 1,
          "timestamp": 1758766676204,
          "success": true,
          "testId": 3
        },
        {
          "numPassedTests": 1,
          "failedTests": 0,
          "numTotalTests": 1,
          "timestamp": 1758766687146,
          "success": true,
          "testId": 3
        },
        {
          "commitId": "469f032eaca7dd35477537de97bea886c8d74327",
          "commitName": "asociates tests to commit",
          "commitTimestamp": 1758766975723,
          "testId": 3
        },
        {
          "numPassedTests": 1,
          "failedTests": 0,
          "numTotalTests": 1,
          "timestamp": 1758767003612,
          "success": true,
          "testId": 4
        },
        {
          "commitId": "f00370bc4a0ecfe8e42cb79957f837c1604f9fa9",
          "commitName": "deleting unused lines",
          "commitTimestamp": 1758768425840,
          "testId": 4
        },
        {
          "numPassedTests": 1,
          "failedTests": 0,
          "numTotalTests": 1,
          "timestamp": 1758768446457,
          "success": true,
          "testId": 5
        },
      ];

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockTDDLogData,
      });

      // Act
      const result = await adapter.obtainTDDLogs(owner, repoName, branch);

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockTDDLogData);
    });

    it('should throw an error if the network request fails', async () => {
      // Arrange
      const owner = 'test-owner';
      const repoName = 'test-repo';

      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(adapter.obtainTDDLogs(owner, repoName, 'main')).rejects.toThrow('Network error');
    });

    it('should throw an error for non-200 status codes', async () => {
      // Arrange
      const owner = 'test-owner';
      const repoName = 'test-repo';

      mockedAxios.get.mockResolvedValue({
        status: 404,
        data: 'Not Found',
      });

      // Act & Assert
      await expect(adapter.obtainTDDLogs(owner, repoName, 'main')).rejects.toThrow('HTTP error! Status: 404');
    });
  });
});
