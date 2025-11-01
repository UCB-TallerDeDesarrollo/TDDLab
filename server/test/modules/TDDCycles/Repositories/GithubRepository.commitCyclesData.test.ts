import { GithubRepository } from "../../../../src/modules/TDDCycles/Repositories/GithubRepository";

describe("GithubRepository.getCommitCyclesData", () => {
  let githubRepository: GithubRepository;
  beforeEach(() => {
    githubRepository = new GithubRepository();
    // @ts-ignore
    githubRepository.fetchCommitHistoryJson = jest.fn().mockResolvedValue([
      {
        sha: "789",
        commit: { url: "url3" },
        tdd_cycle: "Red-Green-Refactor",
        coverage: 75,
      },
      {
        sha: "456",
        commit: { url: "url2" },
        tdd_cycle: null,
        coverage: 80,
      },
    ]);
  });

  it("should map cycles and coverage correctly", async () => {
    const result = await githubRepository.getCommitCyclesData("owner", "repo");
    expect(result).toEqual([
      {
        sha: "789",
        url: "url3",
        tddCycle: "Red-Green-Refactor",
        coverage: 75,
      },
      {
        sha: "456",
        url: "url2",
        tddCycle: "null",
        coverage: 80,
      },
    ]);
  });
});
