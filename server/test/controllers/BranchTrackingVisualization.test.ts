import { Request, Response } from "express";
import { BranchTrackingController } from "../../src/controllers/TDDCycles/BranchTrackingController";
import { BranchTrackingRepository } from "../../src/modules/TDDCycles/Repositories/BranchTrackingRepository";

jest.mock("../../src/modules/TDDCycles/Repositories/BranchTrackingRepository");
jest.mock("../../src/modules/TDDCycles/Repositories/GithubRepository");

describe("branch visualization", () => {
  it("persists divisor before reading and derives cycles from the same history", async () => {
    const commits = [{ sha: "abc", commit: { url: "url" }, tdd_cycle: "green", coverage: 100 }];
    const repository = {
      ingest: jest.fn().mockResolvedValue(undefined),
      getCommitHistory: jest.fn().mockResolvedValue(commits),
      getTestLog: jest.fn().mockResolvedValue([]),
    };
    const github = { getBranches: jest.fn(), getBranchSnapshot: jest.fn().mockResolvedValue({
      resolvedSha: "abc", files: { commitHistory: { records: commits }, tddLog: { records: [] } },
    }) };
    const controller = new BranchTrackingController(repository as unknown as BranchTrackingRepository, github);
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await controller.visualization({ query: { owner: "RashLop", repoName: "repo", branch: "feature/divisor" } } as unknown as Request, res as unknown as Response);
    expect(repository.ingest).toHaveBeenCalledWith(expect.objectContaining({ branch: "feature/divisor", sha: "abc" }));
    expect(repository.ingest.mock.invocationCallOrder[0]).toBeLessThan(repository.getCommitHistory.mock.invocationCallOrder[0]);
    expect(res.json).toHaveBeenCalledWith({ commits, tddLogs: [], commitsTddCycles: [{ sha: "abc", url: "url", tddCycle: "green", coverage: 100 }] });
    repository.ingest.mockRejectedValueOnce({ code: "23503" });
    repository.getCommitHistory.mockClear();
    await controller.visualization({ query: { owner: "RashLop", repoName: "repo", branch: "feature/divisor" } } as unknown as Request, res as unknown as Response);
    expect(res.status).toHaveBeenLastCalledWith(503);
    expect(repository.getCommitHistory).not.toHaveBeenCalled();
    await controller.visualization({ query: { owner: "RashLop", repoName: "repo", branch: "feature/divisor" } } as unknown as Request, res as unknown as Response);
    expect(repository.getCommitHistory).toHaveBeenCalledTimes(1);
  });
});
