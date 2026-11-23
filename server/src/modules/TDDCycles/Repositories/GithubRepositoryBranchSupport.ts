import { Pool } from "pg";
import { branchSupportPool } from "../../../config/branchSupportDb";
import { CommitHistoryDataBranchSupport } from "../Domain/ICommitHistoryDataBranchSupport";
import { CommitCycleDataBranchSupport } from "../Domain/ICommitCycleDataBranchSupport";
import { IGithubRepositoryBranchSupport } from "../Domain/IGithubRepositoryBranchSupport";

export class GithubRepositoryBranchSupport implements IGithubRepositoryBranchSupport {
  private readonly pool: Pool;

  constructor(pool: Pool = branchSupportPool) {
    this.pool = pool;
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
    const client = await this.pool.connect();
    try {
      const res = await client.query(query, [owner, repoName]);
      return res.rows.map((row: { name: string }) => row.name);
    } finally {
      client.release();
    }
  }

  async getCommitHistoryData(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitHistoryDataBranchSupport[]> {
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

    if (branch) {
      values.push(branch);
      query += `
        AND c.sha IN (
          SELECT bc2.commit_sha
          FROM branch_commit bc2
          JOIN branch b2 ON bc2.branch_id = b2.id
          WHERE b2.project_id = p.id AND b2.name = $3 AND b2.deleted_at IS NULL
        )
      `;
    }

    query += `
      GROUP BY c.project_id, c.sha, c.author, c.author_email, c.message, c.committed_at,
               c.additions, c.deletions, c.total_changes, c.changed_files, p.link,
               te.total_tests, te.passed_tests, te.failed_tests, te.coverage, te.conclusion
      ORDER BY c.committed_at DESC;
    `;

    const client = await this.pool.connect();
    try {
      const res = await client.query(query, values);
      return res.rows.map((row: any) => {
        const repoUrl = (row.repo_url || `https://github.com/${owner}/${repoName}`).replace(/\.git$/, "");
        const branches = Array.isArray(row.branches) ? row.branches : [];
        const parents = Array.isArray(row.parents) ? row.parents : [];
        const primaryBranch = branch || (branches.length > 0 ? branches[0] : "main");

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
          conclusion: row.conclusion || (Number(row.failed_tests) > 0 ? "failure" : "success"),
          branches,
          primary_branch: primaryBranch,
          parents,
        };
      });
    } finally {
      client.release();
    }
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
      const isFailure = item.conclusion === "failure" || item.test_count === 0;

      if (isFailure) {
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
}
