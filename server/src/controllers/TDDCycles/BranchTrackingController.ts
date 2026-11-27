import { Request, Response } from "express";
import { BranchTrackingIngest, BranchTrackingRepository } from "../../modules/TDDCycles/Repositories/BranchTrackingRepository";
import { IGithubRepository } from "../../modules/TDDCycles/Domain/IGithubRepository";
import { isValidBranch } from "../../modules/TDDCycles/Domain/RepositoryRef";
import { GithubRepository } from "../../modules/TDDCycles/Repositories/GithubRepository";

export class BranchTrackingController {
  private readonly activeSynchronizations = new Map<string, Promise<void>>();

  constructor(
    private readonly repository = new BranchTrackingRepository(),
    private readonly githubRepository: Pick<IGithubRepository, "getBranches" | "getBranchSnapshot"> = new GithubRepository(),
  ) {}

  private validSegment(value: unknown): value is string {
    return typeof value === "string" && /^[A-Za-z0-9._-]{1,100}$/.test(value) && value !== "." && value !== "..";
  }

  private validRepository(owner: unknown, repoName: unknown, branch: unknown): boolean {
    return this.validSegment(owner) && this.validSegment(repoName) && isValidBranch(branch);
  }

  /**
   * Refresh one branch before it is read.  A page loads the history, cycles
   * and executions concurrently, so requests for the same branch share this
   * promise instead of issuing three GitHub reads and three transactions.
   */
  private async synchronizeBranch(owner: string, repoName: string, branch: string): Promise<void> {
    const key = `${owner}\u0000${repoName}\u0000${branch}`;
    const active = this.activeSynchronizations.get(key);
    if (active) return active;

    const synchronization = (async () => {
      const snapshot = await this.githubRepository.getBranchSnapshot(owner, repoName, branch);
      await this.repository.ingest({
        repoOwner: owner,
        repoName,
        branch,
        sha: snapshot.resolvedSha,
        commitHistory: snapshot.files.commitHistory.records,
        tddLog: snapshot.files.tddLog.records,
      });
    })();
    this.activeSynchronizations.set(key, synchronization);
    try {
      await synchronization;
    } finally {
      if (this.activeSynchronizations.get(key) === synchronization) {
        this.activeSynchronizations.delete(key);
      }
    }
  }

  private sendReadError(error: unknown, res: Response) {
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
    // Keep credentials and query parameters out of diagnostics.
    console.error("Branch tracking read failed", { code });
    const status = typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: unknown }).status
      : undefined;
    if (status === 404) return res.status(404).json({ error: "BRANCH_NOT_FOUND" });
    return res.status(503).json({ error: "BRANCH_DATA_UNAVAILABLE" });
  }

  async ingest(req: Request, res: Response) {
    const body = req.body as Partial<BranchTrackingIngest> | null;
    if (!body || typeof body !== "object" || !this.validRepository(body.repoOwner, body.repoName, body.branch) || typeof body.sha !== "string" || !body.sha.trim() || !Array.isArray(body.commitHistory) || !Array.isArray(body.tddLog)) {
      return res.status(400).json({ error: "Invalid branch tracking payload" });
    }
    try {
      await this.repository.ingest({
        repoOwner: body.repoOwner as string,
        repoName: body.repoName as string,
        branch: body.branch as string,
        sha: body.sha,
        branchOwner: body.branchOwner,
        commitHistory: body.commitHistory,
        tddLog: body.tddLog,
      });
      return res.status(201).json({ status: "stored" });
    } catch (error) {
      console.error("Error saving branch tracking data:", error);
      return res.status(500).json({ error: "Could not store branch tracking data" });
    }
  }

  async branches(req: Request, res: Response) {
    const { owner, repoName } = req.query;
    if (!this.validSegment(owner) || !this.validSegment(repoName)) return res.status(400).json({ error: "Invalid owner or repoName" });
    try {
      const [remoteBranches, persistedBranches] = await Promise.all([
        this.githubRepository.getBranches(owner, repoName),
        this.repository.getBranches(owner, repoName),
      ]);
      const persistedByName = new Map(persistedBranches.map((branch) => [
        typeof branch === "object" && branch !== null && "name" in branch ? String(branch.name) : "",
        branch,
      ]));
      return res.json({
        branches: remoteBranches.map((branch) => ({
          ...branch,
          persisted: persistedByName.has(branch.name),
        })),
      });
    } catch (error) {
      return this.sendReadError(error, res);
    }
  }

  async commitHistory(req: Request, res: Response) {
    const { owner, repoName, branch = "main" } = req.query;
    if (!this.validRepository(owner, repoName, branch)) return res.status(400).json({ error: "Invalid repository or branch" });
    try {
      const validOwner = owner as string;
      const validRepoName = repoName as string;
      const validBranch = branch as string;
      await this.synchronizeBranch(validOwner, validRepoName, validBranch);
      return res.json(await this.repository.getCommitHistory(validOwner, validRepoName, validBranch));
    } catch (error) {
      return this.sendReadError(error, res);
    }
  }

  async visualization(req: Request, res: Response) {
    const { owner, repoName, branch = "main" } = req.query;
    if (!this.validRepository(owner, repoName, branch)) return res.status(400).json({ error: "Invalid repository or branch" });
    const args: [string, string, string] = [owner as string, repoName as string, branch as string];
    try {
      await this.synchronizeBranch(...args);
      const [commits, tddLogs] = await Promise.all([
        this.repository.getCommitHistory(...args),
        this.repository.getTestLog(...args),
      ]);
      const commitsTddCycles = commits.map((value) => {
        const commit = value as { sha: string; commit: { url: string }; tdd_cycle: string | null; coverage: number };
        return { sha: commit.sha, url: commit.commit.url, tddCycle: commit.tdd_cycle ?? "null", coverage: commit.coverage };
      });
      return res.json({ commits, tddLogs, commitsTddCycles });
    } catch (error) {
      return this.sendReadError(error, res);
    }
  }

  async commitCycles(req: Request, res: Response) {
    const { owner, repoName, branch = "main" } = req.query;
    if (!this.validRepository(owner, repoName, branch)) return res.status(400).json({ error: "Invalid repository or branch" });
    try {
      const validOwner = owner as string;
      const validRepoName = repoName as string;
      const validBranch = branch as string;
      await this.synchronizeBranch(validOwner, validRepoName, validBranch);
      return res.json(await this.repository.getCommitCycles(validOwner, validRepoName, validBranch));
    } catch (error) {
      return this.sendReadError(error, res);
    }
  }

  async testLog(req: Request, res: Response) {
    const { owner, repoName, branch = "main" } = req.query;
    if (!this.validRepository(owner, repoName, branch)) return res.status(400).json({ error: "Invalid repository or branch" });
    try {
      const validOwner = owner as string;
      const validRepoName = repoName as string;
      const validBranch = branch as string;
      await this.synchronizeBranch(validOwner, validRepoName, validBranch);
      return res.json(await this.repository.getTestLog(validOwner, validRepoName, validBranch));
    } catch (error) {
      return this.sendReadError(error, res);
    }
  }
}
