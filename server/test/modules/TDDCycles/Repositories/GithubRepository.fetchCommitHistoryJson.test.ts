import axios from "axios";
import { GithubRepository } from "../../../../src/modules/TDDCycles/Repositories/GithubRepository";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GithubRepository.fetchCommitHistoryJson", () => {
  let githubRepository: GithubRepository;

  const mockDefaultBranch = (branch: string) => {
    jest.spyOn(githubRepository.octokit, "request").mockResolvedValue({
      status: 200,
      data: { default_branch: branch },
    } as unknown as Awaited<ReturnType<typeof githubRepository.octokit.request>>);
  };

  beforeEach(() => {
    githubRepository = new GithubRepository();
    jest.clearAllMocks();
  });

  it("should fetch and return commit-history.json data from the default branch", async () => {
    const mockData = [{ sha: "123" }, { sha: "456" }];
    mockDefaultBranch("master");
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: mockData });

    const result = await githubRepository.fetchCommitHistoryJson("owner", "repo");

    expect(githubRepository.octokit.request).toHaveBeenCalledWith(
      "GET /repos/{owner}/{repo}",
      {
        owner: "owner",
        repo: "repo",
      }
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/owner/repo/master/script/commit-history.json"
    );
    expect(result).toEqual(mockData);
  });

  it("should throw an error if status is not 200", async () => {
    mockDefaultBranch("main");
    mockedAxios.get.mockResolvedValueOnce({ status: 404, data: [] });

    await expect(
      githubRepository.fetchCommitHistoryJson("owner", "repo")
    ).rejects.toThrow("HTTP error! Status: 404");
  });

  it("should throw and log error if axios throws", async () => {
    const error = new Error("Network error");
    mockDefaultBranch("main");
    mockedAxios.get.mockRejectedValueOnce(error);

    await expect(
      githubRepository.fetchCommitHistoryJson("owner", "repo")
    ).rejects.toThrow(error);
  });

  it("should throw if the repository default branch cannot be obtained", async () => {
    const error = new Error("Repository unavailable");
    jest.spyOn(githubRepository.octokit, "request").mockRejectedValueOnce(error);

    await expect(
      githubRepository.fetchCommitHistoryJson("owner", "repo")
    ).rejects.toThrow(error);

    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});
