import axios from 'axios';
import { CommitHistoryAdapter } from '../../../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter';
import { TDDLogEntry } from '../../../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces';

jest.mock('axios');

jest.mock('octokit', () => ({
  Octokit: jest.fn(() => ({
    request: jest.fn(),
  })),
}));

jest.mock('../../../../config', () => ({
  VITE_API: 'http://localhost/api',
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

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
    commitId: '469f032eaca7dd35477537de97bea886c8d74327',
    commitName: 'asociates tests to commit',
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
    commitId: 'f00370bc4a0ecfe8e42cb79957f837c1604f9fa9',
    commitName: 'deleting unused lines',
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

describe('CommitHistoryAdapter', () => {
  let adapter: CommitHistoryAdapter;
  let mockGithubRequest: jest.Mock;

  const owner = 'test-owner';
  const repoName = 'test-repo';

  const mainUrl =
    `https://raw.githubusercontent.com/${owner}/${repoName}/main/script/tdd_log.json`;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockReset();

    adapter = new CommitHistoryAdapter();
    mockGithubRequest = jest.fn();

    adapter.octokit.request =
      mockGithubRequest as unknown as typeof adapter.octokit.request;
  });

  describe('obtainTDDLogs', () => {
    it('should fetch and return TDD log data successfully', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockTDDLogData,
      });

      const result = await adapter.obtainTDDLogs(owner, repoName);

      expect(mockedAxios.get).toHaveBeenCalledWith(mainUrl);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTDDLogData);
      expect(mockGithubRequest).not.toHaveBeenCalled();
    });

    it('should throw an error if the network request fails', async () => {
      mockedAxios.get.mockRejectedValue(
        new Error('Network error'),
      );

      await expect(
        adapter.obtainTDDLogs(owner, repoName),
      ).rejects.toThrow('Network error');

      expect(mockGithubRequest).not.toHaveBeenCalled();
    });

    it('should throw an error for non-200 status codes', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: 'Internal Server Error',
      });

      await expect(
        adapter.obtainTDDLogs(owner, repoName),
      ).rejects.toThrow('HTTP error! Status: 500');
    });

    it('recupera registros de master cuando el archivo no existe en main', async () => {
      mockedAxios.get
        .mockRejectedValueOnce({
          response: { status: 404 },
        })
        .mockResolvedValueOnce({
          status: 200,
          data: mockTDDLogData,
        });

      mockGithubRequest.mockResolvedValue({
        data: {
          default_branch: 'master',
        },
      });

      const result = await adapter.obtainTDDLogs(owner, repoName);

      expect(mockGithubRequest).toHaveBeenCalledWith(
        'GET /repos/{owner}/{repo}',
        {
          owner,
          repo: repoName,
        },
      );

      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        mainUrl,
      );

      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        2,
        `https://raw.githubusercontent.com/${owner}/${repoName}/master/script/tdd_log.json`,
      );

      expect(result).toEqual(mockTDDLogData);
    });

    it('devuelve vacío cuando falta el archivo y la rama predeterminada es main', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404 },
      });

      mockGithubRequest.mockResolvedValue({
        data: {
          default_branch: 'main',
        },
      });

      const result = await adapter.obtainTDDLogs(owner, repoName);

      expect(result).toEqual([]);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('devuelve vacío cuando el archivo tampoco existe en la rama predeterminada', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 404 },
      });

      mockGithubRequest.mockResolvedValue({
        data: {
          default_branch: 'master',
        },
      });

      const result = await adapter.obtainTDDLogs(owner, repoName);

      expect(result).toEqual([]);
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('propaga los errores al consultar la rama predeterminada', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404 },
      });

      mockGithubRequest.mockRejectedValue(
        new Error('GitHub API error'),
      );

      await expect(
        adapter.obtainTDDLogs(owner, repoName),
      ).rejects.toThrow('GitHub API error');
    });

    it('propaga los errores de red al buscar el archivo en otra rama', async () => {
      mockedAxios.get
        .mockRejectedValueOnce({
          response: { status: 404 },
        })
        .mockRejectedValueOnce(
          new Error('Branch network error'),
        );

      mockGithubRequest.mockResolvedValue({
        data: {
          default_branch: 'master',
        },
      });

      await expect(
        adapter.obtainTDDLogs(owner, repoName),
      ).rejects.toThrow('Branch network error');
    });

    it('rechaza un archivo cuyo contenido no es una lista', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: {
          message: 'Formato no compatible',
        },
      });

      await expect(
        adapter.obtainTDDLogs(owner, repoName),
      ).rejects.toThrow(
        'Formato inválido de tdd_log.json: se esperaba una lista de registros.',
      );
    });

    it('acepta un archivo que contiene una lista vacía', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: [],
      });

      await expect(
        adapter.obtainTDDLogs(owner, repoName),
      ).resolves.toEqual([]);
    });
  });
});