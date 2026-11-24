import { Request, Response } from "express";
import { IGithubRepository } from "../../modules/TDDCycles/Domain/IGithubRepository";
import { IBranchRepository } from "../../modules/TDDCycles/Domain/IBranchRepository";
import { GetBranchHistoryUseCase } from "../../modules/TDDCycles/Application/GetBranchHistoryUseCase";
import { SaveBranchUseCase } from "../../modules/TDDCycles/Application/SaveBranchUseCase";
import {
  TddBranchPushRequest,
  TddBranchPushResponse,
  TddMergeRequest,
} from "../../modules/TDDCycles/Domain/InputModels";

class BranchController {
  private readonly getBranchHistoryUseCase: GetBranchHistoryUseCase;
  private readonly saveBranchUseCase: SaveBranchUseCase;
  private readonly branchRepository: IBranchRepository;
  private readonly githubRepository: IGithubRepository;

  constructor(
    githubRepository: IGithubRepository,
    branchRepository: IBranchRepository
  ) {
    this.githubRepository = githubRepository;
    this.branchRepository = branchRepository;
    this.getBranchHistoryUseCase = new GetBranchHistoryUseCase(
      githubRepository,
      branchRepository
    );
    this.saveBranchUseCase = new SaveBranchUseCase(branchRepository);
  }

  isValidGithubSegment(value: unknown): value is string {
    return (
      typeof value === "string" &&
      value.length > 0 &&
      value.length <= 100 &&
      /^[A-Za-z0-9._-]+$/.test(value)
    );
  }

  async getBranchHistory(req: Request, res: Response) {
    try {
      const ownerRaw = req.query.owner;
      const repoNameRaw = req.query.repoName;
      const branchRaw = req.query.branch;

      if (!ownerRaw || !repoNameRaw || !branchRaw) {
        return res.status(400).json({
          error: "Bad request, missing owner, repoName or branch",
        });
      }

      if (
        !this.isValidGithubSegment(ownerRaw) ||
        !this.isValidGithubSegment(repoNameRaw) ||
        !this.isValidGithubSegment(branchRaw)
      ) {
        return res.status(400).json({
          error: "Bad request, invalid owner, repoName or branch",
        });
      }

      const history = await this.getBranchHistoryUseCase.execute(
        String(ownerRaw),
        String(repoNameRaw),
        String(branchRaw)
      );

      return res.status(200).json(history);
    } catch (error) {
      console.error("Error getting branch history:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async saveBranch(req: Request, res: Response) {
    try {
      const body = req.body as TddBranchPushRequest;

      if (!body || !body.repository || !body.repository.slug) {
        return res.status(400).json({
          error: "Bad request, missing repository.slug",
        });
      }

      if (!Array.isArray(body.branches) || !Array.isArray(body.commits)) {
        return res.status(400).json({
          error: "Bad request, branches and commits must be arrays",
        });
      }

      const slug = body.repository.slug;
      const sep = slug.indexOf("/");
      if (sep === -1) {
        return res.status(400).json({
          error: "Bad request, repository.slug must be in format owner/repoName",
        });
      }
      const owner = slug.slice(0, sep);
      const repoName = slug.slice(sep + 1);

      if (!this.isValidGithubSegment(owner) || !this.isValidGithubSegment(repoName)) {
        return res.status(400).json({
          error: "Bad request, invalid owner or repoName",
        });
      }

      // Validate branches
      for (const b of body.branches) {
        if (!b.repositorySlug || !b.name || !b.createdAt) {
          return res.status(400).json({
            error: "Bad request, branch missing repositorySlug, name or createdAt",
          });
        }
      }

      // Validate commits
      for (const c of body.commits) {
        if (
          !c.repositorySlug ||
          !c.commitSha ||
          !c.branch ||
          !c.authorName ||
          !c.message ||
          !c.commitedAt ||
          !Array.isArray(c.tddExecutions)
        ) {
          return res.status(400).json({
            error: "Bad request, commit missing required fields",
          });
        }
        for (const e of c.tddExecutions) {
          if (
            e.testsTotal === undefined ||
            e.testsPassed === undefined ||
            e.testsFailed === undefined ||
            !e.executedAt
          ) {
            return res.status(400).json({
              error: "Bad request, execution missing required fields",
            });
          }
        }
      }

      // Validate merges
      const merges: TddMergeRequest[] = body.merges ?? [];
      for (const m of merges) {
        if (
          !m.repositorySlug ||
          !m.sourceBranch ||
          !m.targetBranch ||
          !m.sourceCommitSha ||
          !m.mergeCommitSha ||
          m.isFastForward === undefined ||
          !m.mergedAt
        ) {
          return res.status(400).json({
            error: "Bad request, merge missing required fields",
          });
        }
      }

      const input: TddBranchPushRequest = {
        repository: body.repository,
        branches: body.branches,
        commits: body.commits,
        merges,
      };

      await this.saveBranchUseCase.execute(input);

      let branchesSaved = 0;
      let commitsSaved = 0;
      let mergesSaved = 0;
      let executionsSaved = 0;

      for (const b of body.branches) {
        try {
          await this.branchRepository.saveBranch(b);
          branchesSaved++;
        } catch {
          // branch may already exist
        }
      }
      for (const c of body.commits) {
        try {
          await this.branchRepository.saveCommit(c);
          commitsSaved++;
          executionsSaved += c.tddExecutions.length;
        } catch {
          // commit may already exist
        }
      }
      for (const m of merges) {
        try {
          await this.branchRepository.saveMerge(m);
          mergesSaved++;
        } catch {
          // merge may already exist
        }
      }

      const response: TddBranchPushResponse = {
        repository: {
          id: 0,
          slug,
          remoteUrl: body.repository.remoteUrl,
          createdAt: new Date().toISOString(),
        },
        branchesSaved,
        commitsSaved,
        mergesSaved,
        executionsSaved,
      };

      return res.status(201).json(response);
    } catch (error) {
      console.error("Error saving branch:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getBranches(req: Request, res: Response) {
    try {
      const { owner, repoName } = req.query;

      if (!owner || !repoName) {
        return res.status(400).json({ error: "Bad request, missing owner or repoName" });
      }

      if (!this.isValidGithubSegment(owner) || !this.isValidGithubSegment(repoName)) {
        return res.status(400).json({ error: "Bad request, invalid owner or repoName" });
      }

      const useNewGen = await this.githubRepository.checkNewGenFile(
        String(owner),
        String(repoName)
      );

      if (!useNewGen) {
        return res.status(200).json([
          { name: "main", repository_slug: `${owner}/${repoName}` },
        ]);
      }

      const repo = await this.branchRepository.getRepository(`${owner}/${repoName}`);
      if (!repo) {
        return res.status(200).json([]);
      }

      const branches = await this.branchRepository.getBranches(`${owner}/${repoName}`);
      return res.status(200).json(branches);
    } catch (error) {
      console.error("Error getting branches:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getMerges(req: Request, res: Response) {
    try {
      const { owner, repoName } = req.query;

      if (!owner || !repoName) {
        return res.status(400).json({ error: "Bad request, missing owner or repoName" });
      }

      if (!this.isValidGithubSegment(owner) || !this.isValidGithubSegment(repoName)) {
        return res.status(400).json({ error: "Bad request, invalid owner or repoName" });
      }

      const useNewGen = await this.githubRepository.checkNewGenFile(
        String(owner),
        String(repoName)
      );

      if (!useNewGen) {
        return res.status(200).json([]);
      }

      const repo = await this.branchRepository.getRepository(`${owner}/${repoName}`);
      if (!repo) {
        return res.status(200).json([]);
      }

      const merges = await this.branchRepository.getMerges(`${owner}/${repoName}`);
      return res.status(200).json(merges);
    } catch (error) {
      console.error("Error getting merges:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
}

export default BranchController;
