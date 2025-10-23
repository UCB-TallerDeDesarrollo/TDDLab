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

  it("should map and sort commits by date descending", async () => {
    const result = await githubRepository.getCommitHistoryData("owner", "repo");
    expect(result[0].sha).toBe("456"); // Most recent first
    expect(result[1].sha).toBe("123");
    expect(result[0].commit.message).toBe("Commit 2");
    expect(result[1].commit.message).toBe("Commit 1");
  });
});
