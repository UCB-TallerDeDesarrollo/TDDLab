import { Request, Response } from "express";
import { ProjectUseCases } from "../../modules/BranchSupport/Application/ProjectUseCases";
import { BranchUseCases } from "../../modules/BranchSupport/Application/BranchUseCases";
import { CommitUseCases } from "../../modules/BranchSupport/Application/CommitUseCases";
import { TestExecutionUseCases } from "../../modules/BranchSupport/Application/TestExecutionUseCases";
import { GraphDataUseCases } from "../../modules/BranchSupport/Application/GraphDataUseCases";
import { SchemaSetupUseCase } from "../../modules/BranchSupport/Application/SchemaSetupUseCase";

export class BranchSupportController {
  constructor(
    private readonly projectUseCases: ProjectUseCases,
    private readonly branchUseCases: BranchUseCases,
    private readonly commitUseCases: CommitUseCases,
    private readonly testExecutionUseCases: TestExecutionUseCases,
    private readonly graphDataUseCases: GraphDataUseCases,
    private readonly schemaSetupUseCase: SchemaSetupUseCase
  ) {}

  // ==================== SCHEMA SETUP ====================
  async setupSchema(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.schemaSetupUseCase.execute();
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Schema setup error:", error);
      res.status(500).json({ error: error.message || "Failed to initialize schema" });
    }
  }

  // ==================== PROJECT ====================
  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const { name, link, github_user, user } = req.body;
      const targetUser = github_user || user || (req.query.user as string);

      if (!name || !link || !targetUser) {
        res.status(400).json({
          error: "Fields 'name', 'link', and 'github_user' (or 'user') are required.",
        });
        return;
      }

      const project = await this.projectUseCases.create({
        name,
        link,
        github_user: targetUser,
      });
      res.status(201).json(project);
    } catch (error: any) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async getProjects(req: Request, res: Response): Promise<void> {
    try {
      const githubUser =
        (req.query.github_user as string) ||
        (req.query.user as string) ||
        undefined;
      const projects = await this.projectUseCases.listByUser(githubUser);
      res.status(200).json(projects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await this.projectUseCases.getById(id);
      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }
      res.status(200).json(project);
    } catch (error: any) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, link } = req.body;
      const updated = await this.projectUseCases.update(id, { name, link });
      if (!updated) {
        res.status(404).json({ error: "Project not found" });
        return;
      }
      res.status(200).json(updated);
    } catch (error: any) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.projectUseCases.delete(id);
      if (!success) {
        res.status(404).json({ error: "Project not found" });
        return;
      }
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // ==================== BRANCH ====================
  async createBranch(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { name, head_commit_sha, fork_commit_sha } = req.body;

      if (!name) {
        res.status(400).json({ error: "Field 'name' is required for a branch" });
        return;
      }

      const branch = await this.branchUseCases.create({
        project_id: projectId,
        name,
        head_commit_sha,
        fork_commit_sha,
      });
      res.status(201).json(branch);
    } catch (error: any) {
      console.error("Error creating branch:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async getBranchesByProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const includeDeleted = req.query.includeDeleted === "true";
      const branches = await this.branchUseCases.listByProject(
        projectId,
        includeDeleted
      );
      res.status(200).json(branches);
    } catch (error: any) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async getBranchById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const branch = await this.branchUseCases.getById(id);
      if (!branch) {
        res.status(404).json({ error: "Branch not found" });
        return;
      }
      res.status(200).json(branch);
    } catch (error: any) {
      console.error("Error fetching branch:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async updateBranchHead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { head_commit_sha } = req.body;

      if (!head_commit_sha) {
        res.status(400).json({ error: "head_commit_sha is required" });
        return;
      }

      const updated = await this.branchUseCases.updateHead(id, head_commit_sha);
      if (!updated) {
        res.status(404).json({ error: "Branch not found" });
        return;
      }
      res.status(200).json(updated);
    } catch (error: any) {
      console.error("Error updating branch head:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async updateBranch(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, head_commit_sha, fork_commit_sha } = req.body;
      const updated = await this.branchUseCases.update(id, {
        name,
        head_commit_sha,
        fork_commit_sha,
      });
      if (!updated) {
        res.status(404).json({ error: "Branch not found" });
        return;
      }
      res.status(200).json(updated);
    } catch (error: any) {
      console.error("Error updating branch:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async deleteBranch(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.branchUseCases.softDelete(id);
      if (!success) {
        res.status(404).json({ error: "Branch not found or already deleted" });
        return;
      }
      res.status(200).json({ message: "Branch deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting branch:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // ==================== COMMIT ====================
  async createCommit(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const {
        sha,
        author,
        author_email,
        message,
        committed_at,
        additions,
        deletions,
        changed_files,
        parent_shas,
        branch_id,
        update_branch_head,
      } = req.body;

      if (!sha || !author || !message || !committed_at) {
        res.status(400).json({
          error: "Fields 'sha', 'author', 'message', and 'committed_at' are required.",
        });
        return;
      }

      const commit = await this.commitUseCases.create({
        project_id: projectId,
        sha,
        author,
        author_email,
        message,
        committed_at,
        additions,
        deletions,
        changed_files,
        parent_shas,
        branch_id,
        update_branch_head: update_branch_head ?? true,
      });
      res.status(201).json(commit);
    } catch (error: any) {
      console.error("Error creating commit:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async getCommitsByProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const branchId = (req.query.branch_id as string) || undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const offset = req.query.offset ? Number(req.query.offset) : undefined;

      const commits = await this.commitUseCases.listByProject(projectId, {
        branchId,
        limit,
        offset,
      });
      res.status(200).json(commits);
    } catch (error: any) {
      console.error("Error fetching commits:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async getCommitBySha(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, sha } = req.params;
      const commit = await this.commitUseCases.getBySha(projectId, sha);
      if (!commit) {
        res.status(404).json({ error: "Commit not found" });
        return;
      }
      res.status(200).json(commit);
    } catch (error: any) {
      console.error("Error fetching commit:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // ==================== TEST EXECUTION ====================
  async createTestExecution(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const {
        branch_id,
        commit_sha,
        source,
        executed_at,
        total_tests,
        passed_tests,
        failed_tests,
        skipped_tests,
        error_tests,
        coverage,
        covered_lines,
        total_lines,
        covered_branches,
        total_branches,
        duration_ms,
        conclusion,
        results,
      } = req.body;

      if (total_tests === undefined || !conclusion) {
        res.status(400).json({
          error: "Fields 'total_tests' and 'conclusion' are required.",
        });
        return;
      }

      const execution = await this.testExecutionUseCases.create({
        project_id: projectId,
        branch_id,
        commit_sha,
        source,
        executed_at,
        total_tests,
        passed_tests: passed_tests ?? 0,
        failed_tests: failed_tests ?? 0,
        skipped_tests,
        error_tests,
        coverage,
        covered_lines,
        total_lines,
        covered_branches,
        total_branches,
        duration_ms,
        conclusion,
        results,
      });
      res.status(201).json(execution);
    } catch (error: any) {
      console.error("Error creating test execution:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async getTestExecutionsByProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const branchId = (req.query.branch_id as string) || undefined;
      const commitSha = (req.query.commit_sha as string) || undefined;
      const source = (req.query.source as string) || undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;

      const executions = await this.testExecutionUseCases.listByProject(
        projectId,
        { branchId, commitSha, source, limit }
      );
      res.status(200).json(executions);
    } catch (error: any) {
      console.error("Error fetching test executions:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async getTestExecutionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.testExecutionUseCases.getById(id);
      if (!result) {
        res.status(404).json({ error: "Test execution not found" });
        return;
      }
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error fetching test execution:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // ==================== GRAPH & ANALYTICS ====================
  async getTopologyGraph(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const graph = await this.graphDataUseCases.getTopologyGraph(projectId);
      res.status(200).json(graph);
    } catch (error: any) {
      console.error("Error fetching topology graph:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async getTestMetricsGraph(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const metrics = await this.graphDataUseCases.getTestMetricsGraph(projectId);
      res.status(200).json(metrics);
    } catch (error: any) {
      console.error("Error fetching test metrics graph:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  async getTDDCyclesGraph(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const branchId = (req.query.branch_id as string) || undefined;
      const cycles = await this.graphDataUseCases.getTDDCyclesGraph(
        projectId,
        branchId
      );
      res.status(200).json(cycles);
    } catch (error: any) {
      console.error("Error fetching TDD cycles graph:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
}
