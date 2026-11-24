import axios from 'axios';
import { CommitHistoryAdapter } from '../../../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter';
import { TDDLogEntry } from '../../../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const owner = 'test-owner';
const repoName = 'test-repo';

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
    commitId: '469f032eaca7dd35477537de97bea886c8d74327',
    commitName: 'asociates tests to commit',
    commitTimestamp: 1758766975723,
    testId: 3,
  },
  {
    numPassedTests: 1,
    failedTests: 1,
    numTotalTests: 2,
    timestamp: 1758767003612,
    success: false,
    testId: 4,
  },
  {
    commitId: 'f00370bc4a0ecfe8e42cb79957f837c1604f9fa9',
    commitName: 'deleting unused lines',
    commitTimestamp: 1758768425840,
    testId: 4,
  },
];

describe('CommitHistoryAdapter', () => {
  let adapter: CommitHistoryAdapter;

  beforeEach(() => {
    adapter = new CommitHistoryAdapter();
    mockedAxios.get.mockReset();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('obtainTDDLogs', () => {
    it('fetches logs from the API with owner and repoName params', async () => {
      const expectedUrl = `${adapter.backAPI}/tdd-logs`;
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockTDDLogData,
      });

      const result = await adapter.obtainTDDLogs(owner, repoName);

      expect(mockedAxios.get).toHaveBeenCalledWith(expectedUrl, {
        params: { owner, repoName },
      });
      expect(mockedAxios.get.mock.calls[0][0]).not.toContain('raw.githubusercontent.com');
      expect(result).toEqual(mockTDDLogData);
    });

    it('normalizes an array of valid log entries', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: [
          ...mockTDDLogData,
          { unexpected: 'entry' },
          null,
          { numPassedTests: '3', failedTests: 0 },
        ],
      });

      const result = await adapter.obtainTDDLogs(owner, repoName);

      expect(result).toEqual(mockTDDLogData);
    });

    it('returns an empty array when the API has no logs', async () => {
      mockedAxios.get.mockResolvedValue({ status: 200, data: [] });

      await expect(adapter.obtainTDDLogs(owner, repoName)).resolves.toEqual([]);
    });

    it('returns an empty array when the API responds with 404', async () => {
      mockedAxios.get.mockResolvedValue({ status: 404, data: 'Not Found' });

      await expect(adapter.obtainTDDLogs(owner, repoName)).resolves.toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('returns an empty array when axios rejects with 404', async () => {
      mockedAxios.get.mockRejectedValue({ response: { status: 404 } });

      await expect(adapter.obtainTDDLogs(owner, repoName)).resolves.toEqual([]);
    });

    it('rethrows network errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(adapter.obtainTDDLogs(owner, repoName)).rejects.toThrow('Network error');
    });

    it('throws an error for other non-200 status codes', async () => {
      mockedAxios.get.mockResolvedValue({ status: 500, data: 'Server Error' });

      await expect(adapter.obtainTDDLogs(owner, repoName)).rejects.toThrow('HTTP error! Status: 500');
    });
  });
});
