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

  describe('obtainTDDLogs', () => {
    it('should fetch and return TDD log data successfully', async () => {
      // Arrange
      const owner = 'test-owner';
      const repoName = 'test-repo';
      const expectedUrl = `${adapter.backAPI}/tdd-logs`;

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
      const result = await adapter.obtainTDDLogs(owner, repoName);

      // Assert
      expect(mockedAxios.get).toHaveBeenCalledWith(expectedUrl, { params: { owner, repoName } });
      expect(result).toEqual(mockTDDLogData);
    });

    it('should throw an error if the network request fails', async () => {
      // Arrange
      const owner = 'test-owner';
      const repoName = 'test-repo';

      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(adapter.obtainTDDLogs(owner, repoName)).rejects.toThrow('Network error');
    });

    it('preserves an empty log returned by the API', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200, data: [] });

      await expect(adapter.obtainTDDLogs('example', 'exercise')).resolves.toEqual([]);
    });

    it('does not hide a missing API endpoint as an empty log', async () => {
      const failure = Object.assign(new Error('Endpoint not found'), { response: { status: 404 } });
      mockedAxios.get.mockRejectedValue(failure);

      await expect(adapter.obtainTDDLogs('example', 'exercise')).rejects.toBe(failure);
    });

    it('rejects a response that is not a log array', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200, data: '<html>Wrong API URL</html>' });

      await expect(adapter.obtainTDDLogs('example', 'exercise')).rejects.toThrow('Invalid TDD logs response');
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
      await expect(adapter.obtainTDDLogs(owner, repoName)).rejects.toThrow('HTTP error! Status: 404');
    });
  });
});
