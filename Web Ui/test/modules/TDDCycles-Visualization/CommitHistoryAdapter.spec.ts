/** @jest-environment node */
import { CommitHistoryAdapter } from "../../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";
import axios from "axios";
import { spawn, ChildProcess } from "node:child_process";
import path from "node:path";
import { VITE_API } from "../../../config";
import main from "../../../../server/test/__mocks__/TDDCycles/dataTypeMocks/branch-sync/main.json";
import branchA from "../../../../server/test/__mocks__/TDDCycles/dataTypeMocks/branch-sync/rama-a.json";
import branchB from "../../../../server/test/__mocks__/TDDCycles/dataTypeMocks/branch-sync/rama-b.json";
import merged from "../../../../server/test/__mocks__/TDDCycles/dataTypeMocks/branch-sync/main-after-merge.json";

// Simulamos `axios` y `Octokit`
jest.mock("axios");
jest.mock("octokit");

const mockedAxios = axios as jest.Mocked<typeof axios>;
describe("CommitHistoryAdapter", () => {
  let adapter: CommitHistoryAdapter;

  beforeEach(() => {
    mockedAxios.get.mockReset();
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
      expect(commits[0].commit.date).toEqual(new Date("2024-01-02"));
      expect(mockedAxios.get).toHaveBeenCalledWith(`${VITE_API}/TDDCycles/commits-history`, { params: { owner: "owner", repoName: "repo" } });
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
      expect(mockedAxios.get).toHaveBeenCalledWith(`${VITE_API}/TDDCycles/commit-cycles`, { params: { owner: "owner", repoName: "repo" } });
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

  describe("obtainBranchHistory", () => {
    const owner = main.repository.owner;
    const repoName = main.repository.name;
    const responseOf = (fixture: typeof main | typeof merged) => ({
      repository: fixture.repository, branch: fixture.branch.name,
      commits: fixture.commits, executions: fixture.executions,
    });

    it.each([main, branchA, branchB, merged])("maps BL-02 history for $branch.name ($branch.headSha)", async fixture => {
      mockedAxios.get.mockResolvedValue({ status: 200, data: responseOf(fixture) });
      const history = await adapter.obtainBranchHistory(owner, repoName, fixture.branch.name);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${VITE_API}/TDDCycles/branch-view`, {
        params: { owner, repoName, branch: fixture.branch.name },
      });
      expect(history.commits).toEqual(fixture.commits.map(commit => ({ ...commit, committedAt: new Date(commit.committedAt) })));
      expect(history.executions).toEqual(fixture.executions);
      expect(fixture.commits[0].committedAt).toEqual(expect.any(String));
    });

    it("preserves unknown values, zero metrics and the original execution association", async () => {
      const data = {
        ...responseOf(branchA),
        commits: [
          { ...branchA.commits[0], committedAt: null, parentShas: null, stats: null, metrics: null },
          { ...branchA.commits[1], metrics: { ...branchA.commits[1].metrics, coveragePercentage: 0, numTotalTests: 0, executionEventId: null } },
        ],
        executions: [{ ...branchA.executions[1], testId: null, coveragePercentage: null }],
      };
      mockedAxios.get.mockResolvedValue({ status: 200, data });
      const result = await adapter.obtainBranchHistory(owner, repoName, 'rama-a');
      expect(result.commits[0]).toEqual(data.commits[0]);
      expect(result.commits[1].metrics).toEqual(data.commits[1].metrics);
      expect(result.executions).toEqual(data.executions);
      expect(result.executions[0].headShaAtExecution).not.toBe(result.executions[0].associatedCommitSha);
    });

    it("handles an empty branch and delegates parameter encoding to Axios", async () => {
      mockedAxios.get.mockResolvedValue({ status: 200, data: { ...responseOf(main), branch: 'feature/login', commits: [], executions: [] } });
      const result = await adapter.obtainBranchHistory(owner, repoName, 'feature/login');
      expect(result.commits).toEqual([]);
      expect(result.executions).toEqual([]);
      expect(mockedAxios.get.mock.calls[0][1]?.params.branch).toBe('feature/login');
    });

    it.each([404, 500, 503])("propagates HTTP %s without falling back to main", async status => {
      const error = Object.assign(new Error(`HTTP ${status}`), { response: { status } });
      mockedAxios.get.mockRejectedValue(error);
      await expect(adapter.obtainBranchHistory(owner, repoName, 'missing')).rejects.toBe(error);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("propagates network errors", async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValue(error);
      await expect(adapter.obtainBranchHistory(owner, repoName, 'main')).rejects.toBe(error);
    });

    it("rejects an unexpected resolved HTTP status", async () => {
      mockedAxios.get.mockResolvedValue({ status: 204 });
      await expect(adapter.obtainBranchHistory(owner, repoName, 'main')).rejects.toThrow('Status: 204');
    });

    it.each(['', ' main '])("rejects invalid branch '%s' without an HTTP call", async branch => {
      await expect(adapter.obtainBranchHistory(owner, repoName, branch)).rejects.toThrow('Invalid branch');
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it.each([
      null,
      { ...responseOf(main), branch: 'other' },
      { ...responseOf(main), repository: { ...main.repository, name: 'other' } },
      { ...responseOf(main), commits: null },
    ])("rejects an incompatible response", async data => {
      mockedAxios.get.mockResolvedValue({ status: 200, data });
      await expect(adapter.obtainBranchHistory(owner, repoName, 'main')).rejects.toThrow('Invalid branch history response');
    });

    it.each(['invalid', undefined, 0])("rejects malformed commit dates: %s", async committedAt => {
      mockedAxios.get.mockResolvedValue({ status: 200, data: { ...responseOf(main), commits: [{ ...main.commits[0], committedAt }] } });
      await expect(adapter.obtainBranchHistory(owner, repoName, 'main')).rejects.toThrow('Invalid commit date');
    });
  });

  it("preserves legacy logs and the optional missing log behavior", async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: [] });
    expect(await adapter.obtainTDDLogs('owner', 'repo')).toEqual([]);
    expect(mockedAxios.get).toHaveBeenCalledWith('https://raw.githubusercontent.com/owner/repo/main/script/tdd_log.json');
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 404 } });
    expect(await adapter.obtainTDDLogs('owner', 'repo')).toEqual([]);
  });

  it("preserves the GitHub user name lookup", async () => {
    const requestUser = jest.fn().mockResolvedValue({ status: 200, data: { name: 'User Name' } });
    adapter.octokit.request = requestUser as unknown as typeof adapter.octokit.request;
    expect(await adapter.obtainUserName('owner')).toBe('User Name');
    expect(requestUser).toHaveBeenCalledWith('GET /users/owner');
  });
});

// End-to-end HTTP: no second API or in-memory implementation. Start the existing
// router with BL-02 enabled, and delegate Axios calls to the actual HTTP client.
describe.each(['initial', 'after-merge'])('real branch-view endpoint (%s)', scenario => {
  let backend: ChildProcess;
  let adapter: CommitHistoryAdapter;
  beforeAll(async () => {
    const serverDirectory = path.resolve(__dirname, '../../../../server');
    const script = `
      const express = require('express');
      const app = express();
      app.use('/api/TDDCycles', require('./src/routes/TDDCyclesRoutes').default);
      const server = app.listen(0, '127.0.0.1', () => console.log('BL04_PORT=' + server.address().port));
      process.stdin.resume();
      process.stdin.on('end', () => server.close());
    `;
    backend = spawn(process.execPath, ['-r', 'ts-node/register', '-e', script], {
      cwd: serverDirectory,
      env: { ...process.env, TS_NODE_PROJECT: path.join(serverDirectory, 'tsconfig.json'), NODE_ENV: 'test', TDD_HISTORY_MOCK: 'true', TDD_HISTORY_MOCK_SCENARIO: scenario },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let diagnostics = '';
    backend.stderr?.on('data', chunk => { diagnostics += chunk.toString(); });
    const port = await new Promise<number>((resolve, reject) => {
      let output = '';
      backend.once('error', reject);
      backend.once('exit', code => reject(new Error(`Backend exited (${code}): ${diagnostics}`)));
      backend.stdout?.on('data', chunk => {
        output += chunk.toString();
        const match = /BL04_PORT=(\d+)/.exec(output);
        if (match) resolve(Number(match[1]));
      });
    });
    adapter = new CommitHistoryAdapter();
    adapter.backAPI = `http://127.0.0.1:${port}/api/TDDCycles`;
    const actualAxios = jest.requireActual<typeof import('axios')>('axios').default;
    mockedAxios.get.mockImplementation((url, config) => actualAxios.get(url, { ...config, adapter: 'http', proxy: false }));
  }, 60000);

  afterAll(async () => {
    mockedAxios.get.mockReset();
    if (backend && backend.exitCode === null) {
      await new Promise<void>(resolve => {
        backend.once('exit', () => resolve());
        backend.stdin?.end();
        const timeout = setTimeout(() => backend.kill(), 3000);
        backend.once('exit', () => clearTimeout(timeout));
      });
    }
  });

  it.each(['main', 'rama-a', 'rama-b'])('reads %s from BL-02 via HTTP', async branch => {
    const fixture = branch === 'main' ? (scenario === 'initial' ? main : merged) : branch === 'rama-a' ? branchA : branchB;
    const result = await adapter.obtainBranchHistory(main.repository.owner, main.repository.name, branch);
    expect(result.commits).toEqual(fixture.commits.map(commit => ({ ...commit, committedAt: new Date(commit.committedAt) })));
    expect(result.executions).toEqual(fixture.executions);
    expect(new Set(result.executions.map(execution => execution.eventId)).size).toBe(result.executions.length);
  });

  it('returns the real backend 404 for an absent branch', async () => {
    await expect(adapter.obtainBranchHistory(main.repository.owner, main.repository.name, 'feature/missing'))
      .rejects.toMatchObject({ response: { status: 404 } });
  });
});
