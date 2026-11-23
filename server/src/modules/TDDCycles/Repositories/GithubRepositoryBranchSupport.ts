import { githubPublicFallback } from "./GithubPublicFallbackBranchSupport";
import { Pool, PoolClient } from "pg";
import { branchSupportPool } from "../../../config/branchSupportDb";
import { CommitHistoryDataBranchSupport } from "../Domain/ICommitHistoryDataBranchSupport";
import { CommitCycleDataBranchSupport } from "../Domain/ICommitCycleDataBranchSupport";
import { TestExecutionDataBranchSupport } from "../Domain/ITestExecutionDataBranchSupport";
import {
  TopologyGraphResponseBranchSupport,
  BranchSummaryBranchSupport,
  CommitGraphNodeBranchSupport,
  CommitGraphEdgeBranchSupport,
} from "../Domain/ITopologyGraphBranchSupport";
import { IGithubRepositoryBranchSupport } from "../Domain/IGithubRepositoryBranchSupport";

export class GithubRepositoryBranchSupport implements IGithubRepositoryBranchSupport {
  private readonly pool: Pool;

  constructor(pool: Pool = branchSupportPool) {
    this.pool = pool;
  }

  private async resolveProjectId(
    client: any,
    owner: string,
    repoName: string
  ): Promise<string | null> {
    const query = `
      SELECT id
      FROM project
      WHERE LOWER(github_user) = LOWER($1) 
        AND (LOWER(name) = LOWER($2) OR link ILIKE '%' || $2 || '%')
      LIMIT 1;
    `;
    const res = await client.query(query, [owner, repoName]);
    return res.rows.length > 0 ? res.rows[0].id.toString() : null;
  }

  private async resolveEffectiveBranch(
    owner: string,
    repoName: string,
    requestedBranch?: string
  ): Promise<string | undefined> {
    if (requestedBranch !== undefined && requestedBranch !== null) {
      const trimmed = requestedBranch.trim();
      if (trimmed.toLowerCase() === "all" || trimmed === "*") {
        return undefined; // Explicitly request all branches
      }
      if (trimmed.length > 0) {
        return trimmed;
      }
    }

    // Default branch is main: verify if 'main' exists, fallback gracefully if not
    const branches = await this.getProjectBranches(owner, repoName);
    if (branches.includes("main")) {
      return "main";
    }
    if (branches.includes("master")) {
      return "master";
    }
    return branches.length > 0 ? branches[0] : "main";
  }

  async getProjectBranches(owner: string, repoName: string): Promise<string[]> {
    const query = `
      SELECT DISTINCT b.name
      FROM branch b
      JOIN project p ON b.project_id = p.id
      WHERE LOWER(p.github_user) = LOWER($1) 
        AND (LOWER(p.name) = LOWER($2) OR p.link ILIKE '%' || $2 || '%')
        AND b.deleted_at IS NULL
      ORDER BY b.name ASC;
    `;
    let client: PoolClient | undefined;
    try {
      client = await this.pool.connect();
      const res = await client.query(query, [owner, repoName]);
      const branches = res.rows.map((row: { name: string }) => row.name);
      if (branches.length > 0) return branches;
    } catch (error) {
      console.warn("BranchSupport DB branches unavailable; trying GitHub:", error);
    } finally {
      client?.release();
    }
    return githubPublicFallback.branches(owner, repoName);
  }

  async getTestExecutions(
    owner: string,
    repoName: string,
    branch?: string,
    commitSha?: string
  ): Promise<TestExecutionDataBranchSupport[]> {
    const effectiveBranch = await this.resolveEffectiveBranch(owner, repoName, branch);

    let query = `
      SELECT 
        te.id,
        te.commit_sha,
        te.branch_id,
        b.name as branch_name,
        te.source,
        te.executed_at,
        te.total_tests,
        te.passed_tests,
        te.failed_tests,
        te.skipped_tests,
        te.error_tests,
        te.coverage,
        te.duration_ms,
        te.conclusion
      FROM test_execution te
      JOIN project p ON te.project_id = p.id
      LEFT JOIN branch b ON te.branch_id = b.id
      WHERE LOWER(p.github_user) = LOWER($1)
        AND (LOWER(p.name) = LOWER($2) OR p.link ILIKE '%' || $2 || '%')
    `;

    const values: any[] = [owner, repoName];

    if (effectiveBranch) {
      values.push(effectiveBranch);
      query += ` AND b.name = $${values.length}`;
    }

    if (commitSha) {
      values.push(commitSha);
      query += ` AND te.commit_sha = $${values.length}`;
    }

    query += ` ORDER BY te.executed_at ASC;`;

    let client: PoolClient | undefined;
    try {
      client = await this.pool.connect();
      const res = await client.query(query, values);
      return res.rows.map((row: any) => {
        const total = Number(row.total_tests || 0);
        const passed = Number(row.passed_tests || 0);
        const failed = Number(row.failed_tests || 0);
        const isSuccess = row.conclusion === "success" || (failed === 0 && total > 0);
        const executedDate = new Date(row.executed_at);

        return {
          id: row.id.toString(),
          commit_sha: row.commit_sha,
          branch_id: row.branch_id ? row.branch_id.toString() : null,
          branch_name: row.branch_name || null,
          source: row.source,
          executed_at: executedDate,
          timestamp: executedDate.getTime(),
          total_tests: total,
          passed_tests: passed,
          failed_tests: failed,
          skipped_tests: Number(row.skipped_tests || 0),
          error_tests: Number(row.error_tests || 0),
          coverage: row.coverage !== null && row.coverage !== undefined ? Number(row.coverage) : null,
          duration_ms: row.duration_ms !== null && row.duration_ms !== undefined ? Number(row.duration_ms) : null,
          conclusion: row.conclusion,
          success: isSuccess,
          numTotalTests: total,
          numPassedTests: passed,
          testId: Number(row.id),
        };
      });
    } catch (error) {
      // GitHub REST commits alone do not contain test execution records.
      console.warn("BranchSupport test executions unavailable:", error);
      return [];
    } finally {
      client?.release();
    }
  }

  async getCommitHistoryData(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitHistoryDataBranchSupport[]> {
    const effectiveBranch = await this.resolveEffectiveBranch(owner, repoName, branch);

    let query = `
      SELECT 
        c.sha,
        c.author,
        c.author_email,
        c.message,
        c.committed_at,
        c.additions,
        c.deletions,
        c.total_changes,
        c.changed_files,
        p.link as repo_url,
        COALESCE(array_remove(array_agg(DISTINCT b.name), NULL), '{}') as branches,
        COALESCE(array_remove(array_agg(DISTINCT cp.parent_sha), NULL), '{}') as parents,
        te.total_tests,
        te.passed_tests,
        te.failed_tests,
        te.coverage,
        te.conclusion
      FROM git_commit c
      JOIN project p ON c.project_id = p.id
      LEFT JOIN branch_commit bc ON c.project_id = bc.project_id AND c.sha = bc.commit_sha
      LEFT JOIN branch b ON bc.branch_id = b.id AND b.deleted_at IS NULL
      LEFT JOIN commit_parent cp ON c.project_id = cp.project_id AND c.sha = cp.commit_sha
      LEFT JOIN LATERAL (
        SELECT total_tests, passed_tests, failed_tests, coverage, conclusion
        FROM test_execution
        WHERE project_id = c.project_id AND commit_sha = c.sha
        ORDER BY executed_at DESC
        LIMIT 1
      ) te ON true
      WHERE LOWER(p.github_user) = LOWER($1) 
        AND (LOWER(p.name) = LOWER($2) OR p.link ILIKE '%' || $2 || '%')
    `;

    const values: any[] = [owner, repoName];

    if (effectiveBranch) {
      values.push(effectiveBranch);
      query += `
        AND c.sha IN (
          SELECT bc2.commit_sha
          FROM branch_commit bc2
          JOIN branch b2 ON bc2.branch_id = b2.id
          WHERE b2.project_id = p.id AND b2.name = $${values.length} AND b2.deleted_at IS NULL
        )
      `;
    }

    query += `
      GROUP BY c.project_id, c.sha, c.author, c.author_email, c.message, c.committed_at,
               c.additions, c.deletions, c.total_changes, c.changed_files, p.link,
               te.total_tests, te.passed_tests, te.failed_tests, te.coverage, te.conclusion
      ORDER BY c.committed_at DESC;
    `;

    let rows: any[] = [];
    try {
      const client = await this.pool.connect();
      try {
        const res = await client.query(query, values);
        rows = res.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.warn("BranchSupport DB commits unavailable; trying GitHub:", error);
      return githubPublicFallback.history(owner, repoName, branch);
    }
    if (rows.length === 0) {
      return githubPublicFallback.history(owner, repoName, branch);
    }

    let testExecutions: TestExecutionDataBranchSupport[] = [];
    try {
      testExecutions = await this.getTestExecutions(owner, repoName, effectiveBranch);
    } catch {
      testExecutions = [];
    }

    const executionsByCommit = new Map<string, TestExecutionDataBranchSupport[]>();
    for (const exec of testExecutions) {
      if (exec.commit_sha) {
        const list = executionsByCommit.get(exec.commit_sha) || [];
        list.push(exec);
        executionsByCommit.set(exec.commit_sha, list);
      }
    }

    return rows.map((row: any) => {
      const repoUrl = (row.repo_url || `https://github.com/${owner}/${repoName}`).replace(/\.git$/, "");
      const branches = Array.isArray(row.branches) ? row.branches : [];
      const parents = Array.isArray(row.parents) ? row.parents : [];
      const primaryBranch = effectiveBranch || (branches.length > 0 ? branches[0] : "main");

      return {
        sha: row.sha,
        html_url: `${repoUrl}/commit/${row.sha}`,
        stats: {
          total: Number(row.total_changes || 0),
          additions: Number(row.additions || 0),
          deletions: Number(row.deletions || 0),
          date: new Date(row.committed_at).toISOString(),
        },
        commit: {
          date: new Date(row.committed_at),
          message: row.message || "",
          url: `${repoUrl}/commit/${row.sha}`,
          comment_count: 0,
        },
        coverage: row.coverage !== null && row.coverage !== undefined ? Number(row.coverage) : null,
        test_count: Number(row.total_tests || 0),
        conclusion: row.conclusion || (row.total_tests == null ? "unknown" : Number(row.failed_tests) > 0 ? "failure" : "success"),
        branches,
        primary_branch: primaryBranch,
        parents,
        test_executions: executionsByCommit.get(row.sha) || [],
      };
    });
  }

  async getCommitCyclesData(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitCycleDataBranchSupport[]> {
    const commits = await this.getCommitHistoryData(owner, repoName, branch);

    let previousHadFailures = false;
    const chronological = [...commits].reverse();
    const cycleMap = new Map<string, string>();

    for (const item of chronological) {
      let cycle = "unknown";
      const isRefactor = /\brefactor(\w*)\b/i.test(item.commit.message);
      const noTestData = item.conclusion === "unknown" ||
        (item.test_count === 0 && item.coverage === null);
      const isFailure = item.conclusion === "failure";

      if (noTestData) {
        cycle = "unknown";
      } else if (isFailure) {
        cycle = "red";
        previousHadFailures = true;
      } else {
        if (isRefactor) {
          cycle = "refactor";
        } else if (previousHadFailures) {
          cycle = "green";
          previousHadFailures = false;
        } else {
          cycle = "green";
        }
      }
      cycleMap.set(item.sha, cycle);
    }

    return commits.map((item) => ({
      sha: item.sha,
      url: item.html_url,
      tddCycle: cycleMap.get(item.sha) || "unknown",
      coverage: item.coverage,
      branch: item.primary_branch,
      branches: item.branches,
    }));
  }

  async getTopologyGraph(
    owner: string,
    repoName: string
  ): Promise<TopologyGraphResponseBranchSupport> {
    let client: PoolClient | undefined;
    try {
      client = await this.pool.connect();
      const projectId = await this.resolveProjectId(client, owner, repoName);
      if (!projectId) {
        return githubPublicFallback.topology(owner, repoName);
      }

      // 1. Branches summary
      const branchesQuery = `
        SELECT b.id, b.name, b.head_commit_sha, b.fork_commit_sha, b.created_at, b.updated_at,
               COUNT(bc.commit_sha)::int as total_commits
        FROM branch b
        LEFT JOIN branch_commit bc ON b.id = bc.branch_id AND b.project_id = bc.project_id
        WHERE b.project_id = $1 AND b.deleted_at IS NULL
        GROUP BY b.id, b.name, b.head_commit_sha, b.fork_commit_sha, b.created_at, b.updated_at
        ORDER BY b.created_at ASC;
      `;
      const branchRes = await client.query(branchesQuery, [projectId]);
      const branches: BranchSummaryBranchSupport[] = branchRes.rows.map((r: any) => ({
        id: r.id.toString(),
        name: r.name,
        head_commit_sha: r.head_commit_sha,
        fork_commit_sha: r.fork_commit_sha,
        created_at: new Date(r.created_at),
        updated_at: new Date(r.updated_at),
        total_commits: Number(r.total_commits || 0),
        is_default: r.name.toLowerCase() === "main",
      }));

      // 2. Nodes (Commits with branches, parents, test metrics)
      const nodesQuery = `
        SELECT c.sha, c.author, c.author_email, c.message, c.committed_at,
               c.additions, c.deletions, c.total_changes, c.changed_files,
               COALESCE(array_remove(array_agg(DISTINCT b.name), NULL), '{}') as branches,
               COALESCE(array_remove(array_agg(DISTINCT cp.parent_sha), NULL), '{}') as parents,
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
        LEFT JOIN branch b ON bc.branch_id = b.id AND b.deleted_at IS NULL
        LEFT JOIN commit_parent cp ON c.project_id = cp.project_id AND c.sha = cp.commit_sha
        LEFT JOIN test_execution te ON c.project_id = te.project_id AND c.sha = te.commit_sha
        WHERE c.project_id = $1
        GROUP BY c.project_id, c.sha, c.author, c.author_email, c.message, c.committed_at,
                 c.additions, c.deletions, c.total_changes, c.changed_files
        ORDER BY c.committed_at ASC;
      `;
      const nodeRes = await client.query(nodesQuery, [projectId]);
      const nodes: CommitGraphNodeBranchSupport[] = nodeRes.rows.map((r: any) => ({
        sha: r.sha,
        author: r.author,
        author_email: r.author_email,
        message: r.message,
        committed_at: new Date(r.committed_at),
        additions: Number(r.additions || 0),
        deletions: Number(r.deletions || 0),
        total_changes: Number(r.total_changes || 0),
        changed_files: Number(r.changed_files || 0),
        branches: Array.isArray(r.branches) ? r.branches : [],
        parents: Array.isArray(r.parents) ? r.parents : [],
        test_runs_count: Number(r.test_runs_count || 0),
        latest_conclusion: r.latest_conclusion,
        latest_coverage: r.latest_coverage !== null && r.latest_coverage !== undefined ? Number(r.latest_coverage) : null,
      }));

      // 3. Edges (DAG parents)
      const edgesQuery = `
        SELECT parent_sha, commit_sha as child_sha, parent_order
        FROM commit_parent
        WHERE project_id = $1
        ORDER BY parent_order ASC;
      `;
      const edgeRes = await client.query(edgesQuery, [projectId]);
      const edges: CommitGraphEdgeBranchSupport[] = edgeRes.rows.map((e: any) => ({
        parent_sha: e.parent_sha,
        child_sha: e.child_sha,
        parent_order: Number(e.parent_order),
      }));

      if (nodes.length === 0) {
        return githubPublicFallback.topology(owner, repoName);
      }
      return {
        project_id: projectId,
        default_branch: branches.find((item) => item.is_default)?.name ?? branches[0]?.name ?? "main",
        branches,
        nodes,
        edges,
      };
    } catch (error) {
      console.warn("BranchSupport DB topology unavailable; trying GitHub:", error);
      return githubPublicFallback.topology(owner, repoName);
    } finally {
      client?.release();
    }
  }
}
