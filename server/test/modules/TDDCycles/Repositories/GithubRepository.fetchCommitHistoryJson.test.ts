import { GithubRepository } from "../../../../src/modules/TDDCycles/Repositories/GithubRepository";
import { createFakeTDDData } from "../../../../src/modules/TDDCycles/Repositories/fakeTDDData";

const mockRequest = jest.fn();

jest.mock("octokit", () => ({
  Octokit: jest.fn().mockImplementation(() => ({ request: mockRequest })),
}));

describe("GithubRepository.fetchCommitHistoryJson", () => {
  let githubRepository: GithubRepository;
  beforeEach(() => {
    mockRequest.mockReset();
    githubRepository = new GithubRepository();
  });

  it("reads the raw JSON through GitHub's default-branch contents endpoint", async () => {
    const mockData = [{ sha: "123" }, { sha: "456" }];
    mockRequest.mockResolvedValueOnce({ status: 200, data: mockData });
    const result = await githubRepository.fetchCommitHistoryJson("owner", "repo");
    expect(mockRequest).toHaveBeenCalledWith(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner: "owner",
        repo: "repo",
        path: "script/commit-history.json",
        headers: { accept: "application/vnd.github.raw+json" },
      },
    );
    expect(result).toEqual(mockData);
  });

  it("parses raw JSON text returned by the client", async () => {
    mockRequest.mockResolvedValueOnce({ status: 200, data: '[{"sha":"123"}]' });
    expect(await githubRepository.fetchCommitHistoryJson("owner", "repo")).toEqual([{ sha: "123" }]);
  });

  it("rejects an object instead of a commit-history array", async () => {
    mockRequest.mockResolvedValueOnce({ status: 200, data: { message: "unexpected" } });
    await expect(githubRepository.fetchCommitHistoryJson("owner", "repo")).rejects.toThrow("expected an array");
  });

  it("should throw an error if status is not 200", async () => {
    mockRequest.mockResolvedValueOnce({ status: 404, data: [] });
    await expect(
      githubRepository.fetchCommitHistoryJson("owner", "repo")
    ).rejects.toThrow("HTTP error! Status: 404");
  });

  it("propagates a failed request", async () => {
    const error = new Error("Network error");
    mockRequest.mockRejectedValueOnce(error);
    await expect(
      githubRepository.fetchCommitHistoryJson("owner", "repo")
    ).rejects.toThrow(error);
  });
});

describe("GithubRepository.getTDDLogs", () => {
  let repository: GithubRepository;

  beforeEach(() => {
    mockRequest.mockReset();
    repository = new GithubRepository();
  });

  it("preserves failed executions with zero passed tests and graph metadata", async () => {
    const { logs } = createFakeTDDData();
    mockRequest.mockResolvedValueOnce({ status: 200, data: logs });
    expect(await repository.getTDDLogs("owner", "repo")).toEqual(logs);
    expect(mockRequest).toHaveBeenCalledWith("GET /repos/{owner}/{repo}/contents/{path}", {
      owner: "owner", repo: "repo", path: "script/tdd_log.json",
      headers: { accept: "application/vnd.github.raw+json" },
    });
  });

  it("accepts a log containing only a commit record", async () => {
    const records = [{ commitId: "sha", commitName: "initial", commitTimestamp: 1, testId: 0 }];
    mockRequest.mockResolvedValueOnce({ status: 200, data: JSON.stringify(records) });
    expect(await repository.getTDDLogs("owner", "repo")).toEqual(records);
  });

  it("accepts an empty log", async () => {
    mockRequest.mockResolvedValueOnce({ status: 200, data: [] });
    expect(await repository.getTDDLogs("owner", "repo")).toEqual([]);
  });

  it("treats a missing optional log as empty", async () => {
    mockRequest.mockRejectedValueOnce(Object.assign(new Error("Not Found"), { status: 404 }));
    expect(await repository.getTDDLogs("owner", "repo")).toEqual([]);
  });

  it.each([403, 429, 500])("propagates HTTP %s instead of inventing executions", async (status) => {
    const error = Object.assign(new Error("Request failed"), { status });
    mockRequest.mockRejectedValueOnce(error);
    await expect(repository.getTDDLogs("owner", "repo")).rejects.toBe(error);
  });

  it.each([{}, [null], [{}], [{ numPassedTests: 0, testId: 0 }]])("rejects malformed log data: %j", async (data) => {
    mockRequest.mockResolvedValueOnce({ status: 200, data });
    await expect(repository.getTDDLogs("owner", "repo")).rejects.toThrow("Invalid tdd_log.json");
  });

  it("rejects malformed optional graph metadata", async () => {
    mockRequest.mockResolvedValueOnce({ status: 200, data: [
      { commitId: "sha", commitName: "commit", commitTimestamp: 1, testId: 0, gitGraph: [{ sha: "sha" }] },
    ] });
    await expect(repository.getTDDLogs("owner", "repo")).rejects.toThrow("Invalid tdd_log.json");
  });
});
