import { GithubRepository } from "../../../../src/modules/TDDCycles/Repositories/GithubRepository";

jest.mock("axios", () => ({ get: jest.fn() }));
const mockCommitHistory = [
    {
    sha: "123",
    commit: {
      url: "url1",
      date: "2022-10-10T10:00:00Z",
      message: "Commit 1",
      comment_count: 1,
    },
    stats: { total: 5, additions: 3, deletions: 2, date: "2022-10-10T10:00:00Z" },
    coverage: 75,
    test_count: 5,
    conclusion: "failure",
  },
  {
    sha: "456",
    commit: {
      url: "url2",
      date: "2023-10-10T10:00:00Z",
      message: "Commit 2",
      comment_count: 2,
    },
    stats: { total: 10, additions: 5, deletions: 5, date: "2023-10-10T10:00:00Z" },
    coverage: 80,
    test_count: 10,
    conclusion: "success",
  },
];

describe("GithubRepository.getCommitHistoryData", () => {
  let githubRepository: GithubRepository;
  beforeEach(() => {
    githubRepository = new GithubRepository();
    // @ts-ignore
    githubRepository.fetchCommitHistoryJson = jest.fn().mockResolvedValue(mockCommitHistory);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should map and sort commits by date descending", async () => {
    const result = await githubRepository.getCommitHistoryData("owner", "repo");
    expect(result[0].sha).toBe("456"); // Most recent first
    expect(result[1].sha).toBe("123");
    expect(result[0].commit.message).toBe("Commit 2");
    expect(result[1].commit.message).toBe("Commit 1");
  });

  it("uses GitHub API data when commit-history.json does not exist", async () => {
    githubRepository.fetchCommitHistoryJson = jest.fn().mockRejectedValue({
      response: { status: 404 },
    });
    jest.spyOn(githubRepository.octokit, "request").mockImplementation(
      (route: any) => {
        if (route === "GET /repos/{owner}/{repo}/commits") {
          return Promise.resolve({
            data: [
              {
                sha: "fallback-sha",
                html_url: "https://github.com/owner/repo/commit/fallback-sha",
                commit: {
                  author: { date: "2026-09-24T10:00:00Z" },
                  message: "Fallback commit",
                  comment_count: 0,
                },
              },
            ],
          } as any);
        }

        if (route === "GET /repos/{owner}/{repo}/actions/runs") {
          return Promise.resolve({
            data: {
              workflow_runs: [
                { head_sha: "fallback-sha", conclusion: "success" },
              ],
            },
          } as any);
        }

        return Promise.resolve({
          data: {
            sha: "fallback-sha",
            html_url: "https://github.com/owner/repo/commit/fallback-sha",
            stats: { total: 6, additions: 4, deletions: 2 },
            commit: {
              author: { date: "2026-09-24T10:00:00Z" },
              message: "Fallback commit",
              comment_count: 0,
            },
          },
        } as any);
      }
    );

    const result = await githubRepository.getCommitHistoryData("owner", "repo");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      sha: "fallback-sha",
      conclusion: "success",
      test_count: 1,
      coverage: 0,
      stats: { total: 6, additions: 4, deletions: 2 },
    });
  });

  it.each(["getCommitHistoryData", "getCommitCyclesData"] as const)(
    "%s keeps repository input out of the fallback warning",
    async (method) => {
      const owner = "owner\r\n[ERROR] injected-owner";
      const repoName = "repo\n[ERROR] injected-repo";
      githubRepository.fetchCommitHistoryJson = jest.fn().mockRejectedValue({
        response: { status: 404 },
      });
      const request = jest
        .spyOn(githubRepository.octokit, "request")
        .mockImplementation(async (route) => ({
          status: 200,
          url: "https://api.github.com",
          headers: {},
          data:
            route === "GET /repos/{owner}/{repo}/actions/runs"
              ? { workflow_runs: [] }
              : [],
        }));
      const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);

      await expect(githubRepository[method](owner, repoName)).resolves.toEqual([]);

      expect(warn).toHaveBeenCalledTimes(1);
      const warning = warn.mock.calls[0].join(" ");
      expect(warning).toContain("script/commit-history.json");
      expect(warning).not.toMatch(/[\r\n]/);
      expect(warning).not.toContain("injected-owner");
      expect(warning).not.toContain("injected-repo");
      expect(request).toHaveBeenCalledWith("GET /repos/{owner}/{repo}/commits", {
        owner,
        repo: repoName,
        per_page: 30,
      });
    }
  );
});
