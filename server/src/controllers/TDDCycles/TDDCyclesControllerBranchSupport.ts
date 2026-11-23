import { Request, Response } from "express";
import { GetCommitHistoryBranchSupportUseCase } from "../../modules/TDDCycles/Application/getCommitHistoryBranchSupportUseCase";
import { GetCommitCyclesBranchSupportUseCase } from "../../modules/TDDCycles/Application/getCommitCyclesBranchSupportUseCase";
import { GetProjectBranchesBranchSupportUseCase } from "../../modules/TDDCycles/Application/getProjectBranchesBranchSupportUseCase";
import { GetTestExecutionsBranchSupportUseCase } from "../../modules/TDDCycles/Application/getTestExecutionsBranchSupportUseCase";
import { GetTopologyGraphBranchSupportUseCase } from "../../modules/TDDCycles/Application/getTopologyGraphBranchSupportUseCase";
import { IGithubRepositoryBranchSupport } from "../../modules/TDDCycles/Domain/IGithubRepositoryBranchSupport";

export class TDDCyclesControllerBranchSupport {
  private readonly getCommitHistoryUseCase: GetCommitHistoryBranchSupportUseCase;
  private readonly getCommitCyclesUseCase: GetCommitCyclesBranchSupportUseCase;
  private readonly getProjectBranchesUseCase: GetProjectBranchesBranchSupportUseCase;
  private readonly getTestExecutionsUseCase: GetTestExecutionsBranchSupportUseCase;
  private readonly getTopologyGraphUseCase: GetTopologyGraphBranchSupportUseCase;

  constructor(repository: IGithubRepositoryBranchSupport) {
    this.getCommitHistoryUseCase = new GetCommitHistoryBranchSupportUseCase(repository);
    this.getCommitCyclesUseCase = new GetCommitCyclesBranchSupportUseCase(repository);
    this.getProjectBranchesUseCase = new GetProjectBranchesBranchSupportUseCase(repository);
    this.getTestExecutionsUseCase = new GetTestExecutionsBranchSupportUseCase(repository);
    this.getTopologyGraphUseCase = new GetTopologyGraphBranchSupportUseCase(repository);
  }

  isValidGithubSegment(value: unknown): value is string {
    return (
      typeof value === "string" &&
      value.length > 0 &&
      value.length <= 100 &&
      /^[A-Za-z0-9._-]+$/.test(value)
    );
  }

  async getCommitHistory(req: Request, res: Response) {
    try {
      const ownerRaw = req.query.owner;
      const repoNameRaw = req.query.repoName;
      const branchRaw = req.query.branch;

      if (!ownerRaw || !repoNameRaw) {
        return res.status(400).json({
          error: "Bad request, missing owner or repoName",
        });
      }

      if (!this.isValidGithubSegment(ownerRaw) || !this.isValidGithubSegment(repoNameRaw)) {
        return res.status(400).json({
          error: "Bad request, invalid owner or repoName",
        });
      }

      const branch = typeof branchRaw === "string" && branchRaw.trim().length > 0 ? branchRaw.trim() : undefined;

      const commits = await this.getCommitHistoryUseCase.execute(
        String(ownerRaw),
        String(repoNameRaw),
        branch
      );
      return res.status(200).json(commits);
    } catch (error) {
      console.error("Error fetching commit history with branch support:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getCommitCycles(req: Request, res: Response) {
    try {
      const { owner, repoName, branch } = req.query;

      if (!owner || !repoName) {
        return res.status(400).json({
          error: "Bad request, missing owner or repoName",
        });
      }

      if (!this.isValidGithubSegment(owner) || !this.isValidGithubSegment(repoName)) {
        return res.status(400).json({
          error: "Bad request, invalid owner or repoName",
        });
      }

      const branchName = typeof branch === "string" && branch.trim().length > 0 ? branch.trim() : undefined;

      const cycles = await this.getCommitCyclesUseCase.execute(
        String(owner),
        String(repoName),
        branchName
      );
      return res.status(200).json(cycles);
    } catch (error) {
      console.error("Error fetching commit cycles with branch support:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getBranches(req: Request, res: Response) {
    try {
      const { owner, repoName } = req.query;

      if (!owner || !repoName) {
        return res.status(400).json({
          error: "Bad request, missing owner or repoName",
        });
      }

      if (!this.isValidGithubSegment(owner) || !this.isValidGithubSegment(repoName)) {
        return res.status(400).json({
          error: "Bad request, invalid owner or repoName",
        });
      }

      const branches = await this.getProjectBranchesUseCase.execute(
        String(owner),
        String(repoName)
      );
      return res.status(200).json(branches);
    } catch (error) {
      console.error("Error fetching branches with branch support:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getTestExecutions(req: Request, res: Response) {
    try {
      const { owner, repoName, branch, commitSha } = req.query;

      if (!owner || !repoName) {
        return res.status(400).json({
          error: "Bad request, missing owner or repoName",
        });
      }

      if (!this.isValidGithubSegment(owner) || !this.isValidGithubSegment(repoName)) {
        return res.status(400).json({
          error: "Bad request, invalid owner or repoName",
        });
      }

      const branchName = typeof branch === "string" && branch.trim().length > 0 ? branch.trim() : undefined;
      const sha = typeof commitSha === "string" && commitSha.trim().length > 0 ? commitSha.trim() : undefined;

      const executions = await this.getTestExecutionsUseCase.execute(
        String(owner),
        String(repoName),
        branchName,
        sha
      );
      return res.status(200).json(executions);
    } catch (error) {
      console.error("Error fetching test executions with branch support:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getTopologyGraph(req: Request, res: Response) {
    try {
      const { owner, repoName } = req.query;

      if (!owner || !repoName) {
        return res.status(400).json({
          error: "Bad request, missing owner or repoName",
        });
      }

      if (!this.isValidGithubSegment(owner) || !this.isValidGithubSegment(repoName)) {
        return res.status(400).json({
          error: "Bad request, invalid owner or repoName",
        });
      }

      const topology = await this.getTopologyGraphUseCase.execute(
        String(owner),
        String(repoName)
      );
      return res.status(200).json(topology);
    } catch (error) {
      console.error("Error fetching topology graph with branch support:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
}
