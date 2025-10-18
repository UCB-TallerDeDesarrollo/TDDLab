import axios from "axios";
import { GithubRepository } from "../../../../src/modules/TDDCycles/Repositories/GithubRepository";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GithubRepository.fetchCommitHistoryJson", () => {
  let githubRepository: GithubRepository;
  beforeEach(() => {
    githubRepository = new GithubRepository();
  });

  it("should fetch and return commit-history.json data", async () => {
    const mockData = [{ sha: "123" }, { sha: "456" }];
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: mockData });
    const result = await githubRepository.fetchCommitHistoryJson("owner", "repo");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/owner/repo/main/script/commit-history.json"
    );
    expect(result).toEqual(mockData);
  });

  it("should throw an error if status is not 200", async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 404, data: [] });
    await expect(
      githubRepository.fetchCommitHistoryJson("owner", "repo")
    ).rejects.toThrow("HTTP error! Status: 404");
  });

  it("should throw and log error if axios throws", async () => {
    const error = new Error("Network error");
    mockedAxios.get.mockRejectedValueOnce(error);
    await expect(
      githubRepository.fetchCommitHistoryJson("owner", "repo")
    ).rejects.toThrow(error);
  });
});
