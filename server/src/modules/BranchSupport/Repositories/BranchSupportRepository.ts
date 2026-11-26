import { Pool } from "pg";
import fs from "fs";
import path from "path";
import branchSupportPool from "../../../config/branchSupportDb";
import { IBranchSupportRepository } from "./IBranchSupportRepository";
import { Project, CreateProjectDTO, UpdateProjectDTO } from "../Domain/IProject";
import { GitCommit, CreateCommitDTO } from "../Domain/IGitCommit";
import { Branch, CreateBranchDTO, UpdateBranchDTO } from "../Domain/IBranch";
import {
  TestExecution,
  TestResult,
  CreateTestExecutionDTO,
} from "../Domain/ITestExecution";
import {
  TopologyGraphResponse,
  TestMetricsGraphResponse,
  TDDCyclePoint,
  CommitGraphNode,
  CommitGraphEdge,
  BranchSummary,
} from "../Domain/IGraphData";

export class BranchSupportRepository implements IBranchSupportRepository {
  private pool: Pool;

  constructor(pool: Pool = branchSupportPool) {
    this.pool = pool;
  }

  public async executeQuery<T = any>(query: string, values?: any[]): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const res = await client.query(query, values);
      return res.rows;
    } finally {
      client.release();
    }
  }

  public async initSchema(): Promise<void> {
    const migrationPath = path.resolve(
      __dirname,
      "../../../db/migrations/initBranchSupport.sql"
    );
    const sql = fs.readFileSync(migrationPath, "utf-8");
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== PROJECT ====================

  async createProject(dto: CreateProjectDTO): Promise<Project> {
    const query = `
      INSERT INTO project (name, link, github_user)
      VALUES ($1, $2, $3)
      RETURNING id, name, link, github_user, created_at;
    `;
    const rows = await this.executeQuery<Project>(query, [
      dto.name,
      dto.link,
      dto.github_user,
    ]);
    return rows[0];
  }

  async getProjectById(id: string): Promise<Project | null> {
    const query = `
      SELECT id, name, link, github_user, created_at
      FROM project
      WHERE id = $1;
    `;
    const rows = await this.executeQuery<Project>(query, [id]);
    return rows[0] || null;
  }

  async getProjectsByUser(githubUser?: string): Promise<Project[]> {
    let query = `
      SELECT id, name, link, github_user, created_at
      FROM project
    `;
    const values: any[] = [];
    if (githubUser) {
      query += ` WHERE github_user = $1`;
      values.push(githubUser);
    }
    query += ` ORDER BY created_at DESC;`;
    return await this.executeQuery<Project>(query, values);
  }

  async updateProject(id: string, dto: UpdateProjectDTO): Promise<Project | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(dto.name);
    }
    if (dto.link !== undefined) {
      fields.push(`link = $${idx++}`);
      values.push(dto.link);
    }

    if (fields.length === 0) {
      return this.getProjectById(id);
    }

    values.push(id);
    const query = `
      UPDATE project
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING id, name, link, github_user, created_at;
    `;
    const rows = await this.executeQuery<Project>(query, values);
    return rows[0] || null;
  }

  async deleteProject(id: string): Promise<boolean> {
    const query = `DELETE FROM project WHERE id = $1;`;
    const client = await this.pool.connect();
    try {
      const res = await client.query(query, [id]);
      return (res.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  // ==================== BRANCH ====================

  async createBranch(dto: CreateBranchDTO): Promise<Branch> {
    const query = `
      INSERT INTO branch (project_id, name, head_commit_sha, fork_commit_sha)
      VALUES ($1, $2, $3, $4)
      RETURNING id, project_id, name, head_commit_sha, fork_commit_sha, created_at, updated_at, deleted_at;
    `;
    const rows = await this.executeQuery<Branch>(query, [
      dto.project_id,
      dto.name,
      dto.head_commit_sha || null,
      dto.fork_commit_sha || null,
    ]);
    return rows[0];
  }

  async getBranchById(id: string): Promise<Branch | null> {
    const query = `
      SELECT id, project_id, name, head_commit_sha, fork_commit_sha, created_at, updated_at, deleted_at
      FROM branch
      WHERE id = $1;
    `;
    const rows = await this.executeQuery<Branch>(query, [id]);
    return rows[0] || null;
  }

  async getBranchesByProject(
    projectId: string,
    includeDeleted: boolean = false
  ): Promise<Branch[]> {
    let query = `
      SELECT id, project_id, name, head_commit_sha, fork_commit_sha, created_at, updated_at, deleted_at
      FROM branch
      WHERE project_id = $1
    `;
    if (!includeDeleted) {
      query += ` AND deleted_at IS NULL`;
    }
    query += ` ORDER BY created_at ASC;`;
    return await this.executeQuery<Branch>(query, [projectId]);
  }

  async updateBranchHead(id: string, headCommitSha: string): Promise<Branch | null> {
    const query = `
      UPDATE branch
      SET head_commit_sha = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, project_id, name, head_commit_sha, fork_commit_sha, created_at, updated_at, deleted_at;
    `;
    const rows = await this.executeQuery<Branch>(query, [headCommitSha, id]);
    return rows[0] || null;
  }

  async updateBranch(id: string, dto: UpdateBranchDTO): Promise<Branch | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(dto.name);
    }
    if (dto.head_commit_sha !== undefined) {
      fields.push(`head_commit_sha = $${idx++}`);
      values.push(dto.head_commit_sha);
    }
    if (dto.fork_commit_sha !== undefined) {
      fields.push(`fork_commit_sha = $${idx++}`);
      values.push(dto.fork_commit_sha);
    }

    if (fields.length === 0) {
      return this.getBranchById(id);
    }

    values.push(id);
    const query = `
      UPDATE branch
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING id, project_id, name, head_commit_sha, fork_commit_sha, created_at, updated_at, deleted_at;
    `;
    const rows = await this.executeQuery<Branch>(query, values);
    return rows[0] || null;
  }

  async softDeleteBranch(id: string): Promise<boolean> {
    const query = `
      UPDATE branch
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL;
    `;
    const client = await this.pool.connect();
    try {
      const res = await client.query(query, [id]);
      return (res.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  // ==================== COMMIT ====================

  async createCommit(dto: CreateCommitDTO): Promise<GitCommit> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const insertCommitQuery = `
        INSERT INTO git_commit (
          project_id, sha, author, author_email, message, committed_at,
          additions, deletions, changed_files
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (project_id, sha) DO UPDATE
        SET author = EXCLUDED.author,
            author_email = EXCLUDED.author_email,
            message = EXCLUDED.message,
            committed_at = EXCLUDED.committed_at,
            additions = EXCLUDED.additions,
            deletions = EXCLUDED.deletions,
            changed_files = EXCLUDED.changed_files
        RETURNING project_id, sha, author, author_email, message, committed_at, additions, deletions, total_changes, changed_files;
      `;

      const commitRes = await client.query(insertCommitQuery, [
        dto.project_id,
        dto.sha,
        dto.author,
        dto.author_email || null,
        dto.message,
        dto.committed_at,
        dto.additions ?? 0,
        dto.deletions ?? 0,
        dto.changed_files ?? 0,
      ]);
      const createdCommit: GitCommit = commitRes.rows[0];

      // Parents
      if (dto.parent_shas && dto.parent_shas.length > 0) {
        for (let i = 0; i < dto.parent_shas.length; i++) {
          const parentSha = dto.parent_shas[i];
          if (parentSha && parentSha !== dto.sha) {
            const parentQuery = `
              INSERT INTO commit_parent (project_id, commit_sha, parent_sha, parent_order)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (project_id, commit_sha, parent_sha) DO NOTHING;
            `;
            await client.query(parentQuery, [
              dto.project_id,
              dto.sha,
              parentSha,
              i + 1,
            ]);
          }
        }
      }

      // Branch link
      if (dto.branch_id) {
        const branchCommitQuery = `
          INSERT INTO branch_commit (branch_id, project_id, commit_sha)
          VALUES ($1, $2, $3)
          ON CONFLICT (branch_id, commit_sha) DO NOTHING;
        `;
        await client.query(branchCommitQuery, [
          dto.branch_id,
          dto.project_id,
          dto.sha,
        ]);

        if (dto.update_branch_head) {
          const updateHeadQuery = `
            UPDATE branch
            SET head_commit_sha = $1
            WHERE id = $2 AND project_id = $3;
          `;
          await client.query(updateHeadQuery, [
            dto.sha,
            dto.branch_id,
            dto.project_id,
          ]);
        }
      }

      await client.query("COMMIT");
      return createdCommit;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getCommitsByProject(
    projectId: string,
    options?: { branchId?: string; limit?: number; offset?: number }
  ): Promise<GitCommit[]> {
    const values: any[] = [projectId];
    let query = "";

    if (options?.branchId) {
      query = `
        SELECT c.project_id, c.sha, c.author, c.author_email, c.message,
               c.committed_at, c.additions, c.deletions, c.total_changes, c.changed_files
        FROM git_commit c
        INNER JOIN branch_commit bc ON c.project_id = bc.project_id AND c.sha = bc.commit_sha
        WHERE c.project_id = $1 AND bc.branch_id = $2
        ORDER BY c.committed_at DESC
      `;
      values.push(options.branchId);
    } else {
      query = `
        SELECT c.project_id, c.sha, c.author, c.author_email, c.message,
               c.committed_at, c.additions, c.deletions, c.total_changes, c.changed_files
        FROM git_commit c
        WHERE c.project_id = $1
        ORDER BY c.committed_at DESC
      `;
    }

    if (options?.limit) {
      values.push(options.limit);
      query += ` LIMIT $${values.length}`;
    }
    if (options?.offset) {
      values.push(options.offset);
      query += ` OFFSET $${values.length}`;
    }

    return await this.executeQuery<GitCommit>(query, values);
  }

  async getCommitBySha(projectId: string, sha: string): Promise<any | null> {
    const commitQuery = `
      SELECT project_id, sha, author, author_email, message,
             committed_at, additions, deletions, total_changes, changed_files
      FROM git_commit
      WHERE project_id = $1 AND sha = $2;
    `;
    const commitRows = await this.executeQuery<GitCommit>(commitQuery, [
      projectId,
      sha,
    ]);
    if (commitRows.length === 0) return null;

    const commit = commitRows[0];

    // Parents
    const parentsQuery = `
      SELECT parent_sha, parent_order
      FROM commit_parent
      WHERE project_id = $1 AND commit_sha = $2
      ORDER BY parent_order ASC;
    `;
    const parents = await this.executeQuery(parentsQuery, [projectId, sha]);

    // Branches seen on
    const branchesQuery = `
      SELECT b.id, b.name
      FROM branch_commit bc
      JOIN branch b ON bc.branch_id = b.id
      WHERE bc.project_id = $1 AND bc.commit_sha = $2;
    `;
    const branches = await this.executeQuery(branchesQuery, [projectId, sha]);

    return {
      ...commit,
      parents: parents.map((p) => p.parent_sha),
      branches,
    };
  }

  // ==================== TEST EXECUTION ====================

  async createTestExecution(dto: CreateTestExecutionDTO): Promise<TestExecution> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const insertExecutionQuery = `
        INSERT INTO test_execution (
          project_id, branch_id, commit_sha, source, executed_at,
          total_tests, passed_tests, failed_tests, skipped_tests, error_tests,
          coverage, covered_lines, total_lines, covered_branches, total_branches,
          duration_ms, conclusion
        ) VALUES (
          $1, $2, $3, $4, COALESCE($5, NOW()),
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15,
          $16, $17
        ) RETURNING id, project_id, branch_id, commit_sha, source, executed_at,
                    total_tests, passed_tests, failed_tests, skipped_tests, error_tests,
                    coverage, covered_lines, total_lines, covered_branches, total_branches,
                    duration_ms, conclusion;
      `;

      const execRes = await client.query(insertExecutionQuery, [
        dto.project_id,
        dto.branch_id || null,
        dto.commit_sha || null,
        dto.source || "local",
        dto.executed_at || null,
        dto.total_tests,
        dto.passed_tests,
        dto.failed_tests,
        dto.skipped_tests ?? 0,
        dto.error_tests ?? 0,
        dto.coverage ?? null,
        dto.covered_lines ?? null,
        dto.total_lines ?? null,
        dto.covered_branches ?? null,
        dto.total_branches ?? null,
        dto.duration_ms ?? null,
        dto.conclusion,
      ]);
      const createdExecution: TestExecution = execRes.rows[0];

      if (dto.results && dto.results.length > 0) {
        for (const res of dto.results) {
          const insertResultQuery = `
            INSERT INTO test_result (
              execution_id, test_name, test_full_name, file_path, status, duration_ms, error_message
            ) VALUES ($1, $2, $3, $4, $5, $6, $7);
          `;
          await client.query(insertResultQuery, [
            createdExecution.id,
            res.test_name,
            res.test_full_name || null,
            res.file_path || null,
            res.status,
            res.duration_ms || null,
            res.error_message || null,
          ]);
        }
      }

      await client.query("COMMIT");
      return createdExecution;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getTestExecutionsByProject(
    projectId: string,
    options?: {
      branchId?: string;
      commitSha?: string;
      source?: string;
      limit?: number;
    }
  ): Promise<TestExecution[]> {
    let query = `
      SELECT id, project_id, branch_id, commit_sha, source, executed_at,
             total_tests, passed_tests, failed_tests, skipped_tests, error_tests,
             coverage, covered_lines, total_lines, covered_branches, total_branches,
             duration_ms, conclusion
      FROM test_execution
      WHERE project_id = $1
    `;
    const values: any[] = [projectId];

    if (options?.branchId) {
      values.push(options.branchId);
      query += ` AND branch_id = $${values.length}`;
    }
    if (options?.commitSha) {
      values.push(options.commitSha);
      query += ` AND commit_sha = $${values.length}`;
    }
    if (options?.source) {
      values.push(options.source);
      query += ` AND source = $${values.length}`;
    }

    query += ` ORDER BY executed_at DESC`;

    if (options?.limit) {
      values.push(options.limit);
      query += ` LIMIT $${values.length}`;
    }

    return await this.executeQuery<TestExecution>(query, values);
  }

  async getTestExecutionById(
    id: string
  ): Promise<{ execution: TestExecution; results: TestResult[] } | null> {
    const execQuery = `
      SELECT id, project_id, branch_id, commit_sha, source, executed_at,
             total_tests, passed_tests, failed_tests, skipped_tests, error_tests,
             coverage, covered_lines, total_lines, covered_branches, total_branches,
             duration_ms, conclusion
      FROM test_execution
      WHERE id = $1;
    `;
    const execRows = await this.executeQuery<TestExecution>(execQuery, [id]);
    if (execRows.length === 0) return null;

    const resultsQuery = `
      SELECT id, execution_id, test_name, test_full_name, file_path, status, duration_ms, error_message
      FROM test_result
      WHERE execution_id = $1
      ORDER BY id ASC;
    `;
    const results = await this.executeQuery<TestResult>(resultsQuery, [id]);

    return {
      execution: execRows[0],
      results,
    };
  }

  // ==================== GRAPH & ANALYTICS ====================

  async getTopologyGraph(projectId: string): Promise<TopologyGraphResponse> {
    // 1. Branches with stats
    const branchesQuery = `
      SELECT b.id, b.name, b.head_commit_sha, b.fork_commit_sha, b.created_at, b.updated_at,
             COUNT(bc.commit_sha)::int as total_commits
      FROM branch b
      LEFT JOIN branch_commit bc ON b.id = bc.branch_id AND b.project_id = bc.project_id
      WHERE b.project_id = $1 AND b.deleted_at IS NULL
      GROUP BY b.id, b.name, b.head_commit_sha, b.fork_commit_sha, b.created_at, b.updated_at
      ORDER BY b.created_at ASC;
    `;
    const branchRows = await this.executeQuery<any>(branchesQuery, [projectId]);

    const branches: BranchSummary[] = branchRows.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      head_commit_sha: row.head_commit_sha,
      fork_commit_sha: row.fork_commit_sha,
      created_at: row.created_at,
      updated_at: row.updated_at,
      total_commits: Number(row.total_commits || 0),
    }));

    // 2. Nodes (Commits with branch names, parents, test runs count, latest test status)
    const nodesQuery = `
      SELECT c.sha, c.author, c.author_email, c.message, c.committed_at,
             c.additions, c.deletions, c.total_changes, c.changed_files,
             COALESCE(
               array_remove(array_agg(DISTINCT b.name), NULL),
               '{}'
             ) as branches,
             COALESCE(
               array_remove(array_agg(DISTINCT cp.parent_sha), NULL),
               '{}'
             ) as parents,
             COUNT(DISTINCT te.id)::int as test_runs_count,
             (
               SELECT te2.conclusion
               FROM test_execution te2
               WHERE te2.project_id = c.project_id AND te2.commit_sha = c.sha
               ORDER BY te2.executed_at DESC LIMIT 1
             ) as latest_conclusion,
             (
               SELECT te2.coverage
               FROM test_execution te2
               WHERE te2.project_id = c.project_id AND te2.commit_sha = c.sha
               ORDER BY te2.executed_at DESC LIMIT 1
             ) as latest_coverage
      FROM git_commit c
      LEFT JOIN branch_commit bc ON c.project_id = bc.project_id AND c.sha = bc.commit_sha
      LEFT JOIN branch b ON bc.branch_id = b.id
      LEFT JOIN commit_parent cp ON c.project_id = cp.project_id AND c.sha = cp.commit_sha
      LEFT JOIN test_execution te ON c.project_id = te.project_id AND c.sha = te.commit_sha
      WHERE c.project_id = $1
      GROUP BY c.project_id, c.sha, c.author, c.author_email, c.message, c.committed_at,
               c.additions, c.deletions, c.total_changes, c.changed_files
      ORDER BY c.committed_at ASC;
    `;
    const nodeRows = await this.executeQuery<any>(nodesQuery, [projectId]);

    const nodes: CommitGraphNode[] = nodeRows.map((r) => ({
      sha: r.sha,
      author: r.author,
      author_email: r.author_email,
      message: r.message,
      committed_at: r.committed_at,
      additions: Number(r.additions || 0),
      deletions: Number(r.deletions || 0),
      total_changes: Number(r.total_changes || 0),
      changed_files: Number(r.changed_files || 0),
      branches: r.branches || [],
      parents: r.parents || [],
      test_runs_count: Number(r.test_runs_count || 0),
      latest_conclusion: r.latest_conclusion,
      latest_coverage: r.latest_coverage !== null ? Number(r.latest_coverage) : null,
    }));

    // 3. Edges
    const edgesQuery = `
      SELECT parent_sha, commit_sha as child_sha, parent_order
      FROM commit_parent
      WHERE project_id = $1
      ORDER BY parent_order ASC;
    `;
    const edgeRows = await this.executeQuery<any>(edgesQuery, [projectId]);
    const edges: CommitGraphEdge[] = edgeRows.map((e) => ({
      parent_sha: e.parent_sha,
      child_sha: e.child_sha,
      parent_order: Number(e.parent_order),
    }));

    return {
      project_id: projectId,
      branches,
      nodes,
      edges,
    };
  }

  async getTestMetricsGraph(projectId: string): Promise<TestMetricsGraphResponse> {
    const timelineQuery = `
      SELECT te.id as execution_id, te.branch_id, b.name as branch_name,
             te.commit_sha, te.source, te.executed_at,
             te.total_tests, te.passed_tests, te.failed_tests, te.skipped_tests, te.error_tests,
             te.coverage, te.duration_ms, te.conclusion
      FROM test_execution te
      LEFT JOIN branch b ON te.branch_id = b.id
      WHERE te.project_id = $1
      ORDER BY te.executed_at ASC;
    `;
    const rows = await this.executeQuery<any>(timelineQuery, [projectId]);

    const timeline = rows.map((r) => ({
      execution_id: r.execution_id.toString(),
      branch_id: r.branch_id ? r.branch_id.toString() : null,
      branch_name: r.branch_name || "detached / local",
      commit_sha: r.commit_sha,
      source: r.source,
      executed_at: r.executed_at,
      total_tests: Number(r.total_tests || 0),
      passed_tests: Number(r.passed_tests || 0),
      failed_tests: Number(r.failed_tests || 0),
      skipped_tests: Number(r.skipped_tests || 0),
      error_tests: Number(r.error_tests || 0),
      coverage: r.coverage !== null ? Number(r.coverage) : null,
      duration_ms: r.duration_ms !== null ? Number(r.duration_ms) : null,
      conclusion: r.conclusion,
    }));

    // Group summaries per branch
    const branchSummaries: Record<string, any> = {};
    for (const point of timeline) {
      const bKey = point.branch_name;
      if (!branchSummaries[bKey]) {
        branchSummaries[bKey] = {
          branch_name: bKey,
          total_runs: 0,
          passed_runs: 0,
          failed_runs: 0,
          latest_coverage: null,
        };
      }
      branchSummaries[bKey].total_runs++;
      if (point.conclusion === "success") {
        branchSummaries[bKey].passed_runs++;
      } else if (point.conclusion === "failure" || point.conclusion === "error") {
        branchSummaries[bKey].failed_runs++;
      }
      if (point.coverage !== null && point.coverage !== undefined) {
        branchSummaries[bKey].latest_coverage = point.coverage;
      }
    }

    return {
      project_id: projectId,
      timeline,
      branch_summaries: branchSummaries,
    };
  }

  async getTDDCyclesGraph(
    projectId: string,
    branchId?: string
  ): Promise<TDDCyclePoint[]> {
    let query = `
      SELECT c.sha as commit_sha, c.committed_at, c.message,
             c.additions, c.deletions, c.total_changes,
             te.conclusion as test_conclusion,
             te.passed_tests, te.failed_tests, te.coverage
      FROM git_commit c
    `;
    const values: any[] = [projectId];

    if (branchId) {
      query += `
        INNER JOIN branch_commit bc ON c.project_id = bc.project_id AND c.sha = bc.commit_sha
        LEFT JOIN LATERAL (
          SELECT te2.conclusion, te2.passed_tests, te2.failed_tests, te2.coverage
          FROM test_execution te2
          WHERE te2.project_id = c.project_id AND te2.commit_sha = c.sha
          ORDER BY te2.executed_at DESC LIMIT 1
        ) te ON true
        WHERE c.project_id = $1 AND bc.branch_id = $2
      `;
      values.push(branchId);
    } else {
      query += `
        LEFT JOIN LATERAL (
          SELECT te2.conclusion, te2.passed_tests, te2.failed_tests, te2.coverage
          FROM test_execution te2
          WHERE te2.project_id = c.project_id AND te2.commit_sha = c.sha
          ORDER BY te2.executed_at DESC LIMIT 1
        ) te ON true
        WHERE c.project_id = $1
      `;
    }

    query += ` ORDER BY c.committed_at ASC;`;

    const rows = await this.executeQuery<any>(query, values);

    let previousHadFailures = false;

    return rows.map((r) => {
      const failed = Number(r.failed_tests || 0);
      const passed = Number(r.passed_tests || 0);
      const additions = Number(r.additions || 0);
      const deletions = Number(r.deletions || 0);

      let phase: "red" | "green" | "refactor" | "unknown" = "unknown";

      if (r.test_conclusion === "failure" || failed > 0) {
        phase = "red";
        previousHadFailures = true;
      } else if (r.test_conclusion === "success" && passed > 0) {
        if (previousHadFailures) {
          phase = "green";
          previousHadFailures = false;
        } else if (additions > 0 || deletions > 0) {
          phase = "refactor";
        } else {
          phase = "green";
        }
      }

      return {
        commit_sha: r.commit_sha,
        committed_at: r.committed_at,
        message: r.message,
        additions,
        deletions,
        total_changes: Number(r.total_changes || additions + deletions),
        test_conclusion: r.test_conclusion,
        passed_tests: passed,
        failed_tests: failed,
        coverage: r.coverage !== null ? Number(r.coverage) : null,
        phase_hint: phase,
      };
    });
  }
}
