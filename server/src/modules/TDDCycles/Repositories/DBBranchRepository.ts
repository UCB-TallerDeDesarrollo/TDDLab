import { Pool } from "pg";
import { branchDbConfig } from "../../../config/branch-db";
import { IBranchRepository } from "../Domain/IBranchRepository";
import { BranchData } from "../Domain/BranchData";
import { BranchHistoryData } from "../Domain/BranchData";
import { MergeInfo } from "../Domain/IMergeInfo";
import { RepositorySata } from "../Domain/IRepositoryData";
import { CommitHistoryData } from "../Domain/ICommitHistoryData";
import {
  TddRepositoryRequest,
  TddRepositoryResponse,
  TddBranchRequest,
  TddCommitRequest,
  TddMergeRequest,
  TddExecutionRequest,
} from "../Domain/InputModels";

export class DBBranchRepository implements IBranchRepository {
  pool: Pool;
  constructor() {
    this.pool = new Pool({
      ...branchDbConfig,
      idleTimeoutMillis: 30 * 60 * 1000, // 30 min
      max: 10,
    });
    // Warmup: establecer la conexión SSL/TCP antes de la primera petición real
    // para evitar que el primer request tarde varios segundos.
    this.pool
      .query("SELECT 1")
      .then(() => this.pool.query("SELECT count(*) FROM tdd_repository"))
      .catch(() => {
        // Ignorar errores de warmup; la primera query real intentará reconectar
      });
  }

  private splitSlug(slug: string): { owner: string; repoName: string } {
    const sep = slug.indexOf("/");
    if (sep === -1) {
      return { owner: slug, repoName: slug };
    }
    return { owner: slug.slice(0, sep), repoName: slug.slice(sep + 1) };
  }

  async repositoryExists(slug: string): Promise<boolean> {
    const { owner, repoName } = this.splitSlug(slug);
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT COUNT(*) FROM tdd_repository
        WHERE owner = $1 AND repos_name = $2
      `;
      const values = [owner, repoName];
      const result = await client.query(query, values);
      return Number(result.rows[0].count) > 0;
    } catch (error) {
      console.error(
        "Error checking repository existence in tdd_repository:",
        error,
      );
      throw error;
    } finally {
      client.release();
    }
  }

  async saveRepository(
    repo: TddRepositoryRequest,
  ): Promise<TddRepositoryResponse> {
    const { owner, repoName } = this.splitSlug(repo.slug);
    const client = await this.pool.connect();
    try {
      const existing = await this.getRepository(repo.slug);
      if (existing) {
        return {
          id: Number(existing.slug),
          slug: repo.slug,
          remoteUrl: existing.remote_url,
          createdAt: new Date().toISOString(),
        };
      }
      const query = `
        INSERT INTO tdd_repository (repos_name, repo_url, owner)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      const values = [repoName, repo.remoteUrl ?? null, owner];
      const result = await client.query(query, values);
      const row = result.rows[0];
      return {
        id: Number(row.id),
        slug: repo.slug,
        remoteUrl: repo.remoteUrl,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error saving repository to tdd_repository:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getRepository(slug: string): Promise<RepositorySata | null> {
    const { owner, repoName } = this.splitSlug(slug);
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT id, repos_name, repo_url, owner FROM tdd_repository
        WHERE owner = $1 AND repos_name = $2
      `;
      const values = [owner, repoName];
      const result = await client.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }
      const row = result.rows[0];
      return {
        slug: row.id,
        remote_url: row.repo_url,
        branch_count: 0,
        commint_count: 0,
      };
    } catch (error) {
      console.error("Error getting repository from tdd_repository:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async saveBranch(branch: TddBranchRequest): Promise<string> {
    const { owner: _owner } = this.splitSlug(branch.repositorySlug);
    const client = await this.pool.connect();
    try {
      const existing = await this.getBranchByName(
        branch.repositorySlug,
        branch.name,
      );
      if (existing) {
        return existing.name;
      }
      const repo = await this.getRepository(branch.repositorySlug);
      if (!repo) {
        throw new Error(`Repository ${branch.repositorySlug} not found`);
      }
      const query = `
        INSERT INTO tdd_branch (name, fork_commit_sha, created_at, repo_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
      const values = [
        branch.name,
        branch.forkCommitSha ?? null,
        branch.createdAt,
        repo.slug,
      ];
      const result = await client.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error("Error saving branch to tdd_branch:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getBranches(repositorySlug: string): Promise<BranchData[]> {
    const repo = await this.getRepository(repositorySlug);
    if (!repo) {
      return [];
    }
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT id, name, fork_commit_sha, created_at, repo_id FROM tdd_branch
        WHERE repo_id = $1
      `;
      const values = [repo.slug];
      const result = await client.query(query, values);
      return result.rows.map((row: any) => ({
        repository_slug: repositorySlug,
        name: row.name,
        fork_commit_sha: row.fork_commit_sha,
        created_at: row.created_at,
        commit_count: 0,
        last_commit_sha: "",
        last_commit_at: new Date(),
        merge_into: "",
      }));
    } catch (error) {
      console.error("Error getting branches from tdd_branch:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getBranchByName(
    repositorySlug: string,
    branchName: string,
  ): Promise<BranchData | null> {
    const repo = await this.getRepository(repositorySlug);
    if (!repo) {
      return null;
    }
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT id, name, fork_commit_sha, created_at, repo_id FROM tdd_branch
        WHERE repo_id = $1 AND name = $2
      `;
      const values = [repo.slug, branchName];
      const result = await client.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }
      const row = result.rows[0];
      return {
        repository_slug: repositorySlug,
        name: row.name,
        fork_commit_sha: row.fork_commit_sha,
        created_at: row.created_at,
        commit_count: 0,
        last_commit_sha: "",
        last_commit_at: new Date(),
        merge_into: "",
      };
    } catch (error) {
      console.error("Error getting branch by name from tdd_branch:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async saveCommit(commit: TddCommitRequest): Promise<void> {
    const client = await this.pool.connect();
    try {
      const branchRow = await this.getBranchRowByName(
        commit.repositorySlug,
        commit.branch,
      );
      if (!branchRow) {
        throw new Error(
          `Branch ${commit.branch} not found in ${commit.repositorySlug}`,
        );
      }

      await client.query("BEGIN");
      try {
        const commitQuery = `
          INSERT INTO tdd_commit (sha, parent_sha, branch_id, author, message, committed_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (sha) DO NOTHING
        `;
        await client.query(commitQuery, [
          commit.commitSha,
          commit.parentCommitSha ?? null,
          branchRow.id,
          commit.authorName,
          commit.message,
          commit.commitedAt,
        ]);

        for (const exec of commit.tddExecutions) {
          const execQuery = `
            INSERT INTO tdd_execution (commit_sha, tests_total, tests_passed, tests_failed, executed_at)
            VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(execQuery, [
            commit.commitSha,
            exec.testsTotal,
            exec.testsPassed,
            exec.testsFailed,
            exec.executedAt,
          ]);
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    } catch (error) {
      console.error("Error saving commit to tdd_commit:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async saveMerge(merge: TddMergeRequest): Promise<number> {
    const client = await this.pool.connect();
    try {
      const sourceBranchRow = await this.getBranchRowByName(
        merge.repositorySlug,
        merge.sourceBranch,
      );
      const targetBranchRow = await this.getBranchRowByName(
        merge.repositorySlug,
        merge.targetBranch,
      );

      if (!sourceBranchRow || !targetBranchRow) {
        throw new Error(
          `Source or target branch not found in ${merge.repositorySlug}`,
        );
      }

      const query = `
        INSERT INTO tdd_merge (source_branch_id, target_branch_id, source_commit_sha, merge_commit_sha, is_fast_forward, merged_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const values = [
        sourceBranchRow.id,
        targetBranchRow.id,
        merge.sourceCommitSha,
        merge.mergeCommitSha,
        merge.isFastForward ? 1 : 0,
        merge.mergedAt,
      ];
      const result = await client.query(query, values);
      return Number(result.rows[0].id);
    } catch (error) {
      console.error("Error saving merge to tdd_merge:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getMerges(repositorySlug: string): Promise<MergeInfo[]> {
    const repo = await this.getRepository(repositorySlug);
    if (!repo) {
      return [];
    }
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT m.source_branch_id, m.target_branch_id, m.is_fast_forward
        FROM tdd_merge m
        JOIN tdd_branch sb ON sb.id = m.source_branch_id
        JOIN tdd_branch tb ON tb.id = m.target_branch_id
        WHERE sb.repo_id = $1 AND tb.repo_id = $1
      `;
      const values = [repo.slug];
      const result = await client.query(query, values);
      return result.rows.map((row: any) => ({
        source_branch: row.source_branch_id,
        target_branch: row.target_branch_id,
        is_fast_forward:
          row.is_fast_forward === 1 || row.is_fast_forward === true,
      }));
    } catch (error) {
      console.error("Error getting merges from tdd_merge:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getBranchHistory(
    owner: string,
    repoName: string,
    branch: string,
  ): Promise<BranchHistoryData | null> {
    const slug = `${owner}/${repoName}`;
    const client = await this.pool.connect();
    try {
      const repo = await this.getRepository(slug);
      if (!repo) {
        return null;
      }
      const branchRow = await this.getBranchRowByName(slug, branch);
      if (!branchRow) {
        return null;
      }
      const commitQuery = `
        SELECT sha, parent_sha, author, message, committed_at FROM tdd_commit
        WHERE branch_id = $1
        ORDER BY committed_at DESC
      `;
      const commitResult = await client.query(commitQuery, [branchRow.id]);

      const branchData: BranchData = {
        repository_slug: slug,
        name: branchRow.name,
        fork_commit_sha: branchRow.fork_commit_sha,
        created_at: branchRow.created_at,
        commit_count: commitResult.rows.length,
        last_commit_sha:
          commitResult.rows.length > 0
            ? commitResult.rows[0].sha
            : "",
        last_commit_at:
          commitResult.rows.length > 0 && commitResult.rows[0].committed_at
            ? new Date(commitResult.rows[0].committed_at)
            : new Date(),
        merge_into: "",
      };

      // Obtener merge_into: en qué rama se fusionó esta rama (donde es source_branch)
      const mergeIntoQuery = `
        SELECT tb.name AS target_branch_name
        FROM tdd_merge m
        JOIN tdd_branch tb ON tb.id = m.target_branch_id
        WHERE m.source_branch_id = $1
        ORDER BY m.merged_at DESC
        LIMIT 1
      `;
      const mergeIntoResult = await client.query(mergeIntoQuery, [branchRow.id]);
      if (mergeIntoResult.rows.length > 0) {
        branchData.merge_into = mergeIntoResult.rows[0].target_branch_name;
      }

      // Obtener ejecuciones de tests para todos los commits de este branch en una sola consulta
      const shas = commitResult.rows.map((row) => row.sha);
      const executionsBySha: Record<string, TddExecutionRequest[]> = {};
      if (shas.length > 0) {
        const execQuery = `
          SELECT commit_sha, tests_total, tests_passed, tests_failed, executed_at
          FROM tdd_execution
          WHERE commit_sha = ANY($1)
          ORDER BY executed_at ASC
        `;
        const execResult = await client.query(execQuery, [shas]);
        for (const row of execResult.rows) {
          if (!executionsBySha[row.commit_sha]) {
            executionsBySha[row.commit_sha] = [];
          }
          executionsBySha[row.commit_sha].push({
            testsTotal: row.tests_total,
            testsPassed: row.tests_passed,
            testsFailed: row.tests_failed,
            executedAt: row.executed_at,
          });
        }
      }

      const commits: CommitHistoryData[] = commitResult.rows.map(
        (row: any) => {
          const execs = executionsBySha[row.sha] ?? [];
          const lastExec = execs.length > 0 ? execs[execs.length - 1] : null;
          return {
            repository_slug: slug,
            branch,
            html_url: `https://github.com/${owner}/${repoName}/commit/${row.sha}`,
            sha: row.sha,
            parent_sha: row.parent_sha,
            author: row.author,
            stats: {
              total: lastExec ? lastExec.testsTotal : 0,
              additions: 0,
              deletions: 0,
              date: lastExec ? lastExec.executedAt : "",
            },
            commit: {
              date: row.committed_at ? new Date(row.committed_at) : new Date(),
              message: row.message,
              url: `https://github.com/${owner}/${repoName}/commit/${row.sha}`,
              comment_count: 0,
            },
            coverage: lastExec
              ? Math.round(
                  (lastExec.testsPassed / lastExec.testsTotal) * 100
                )
              : 0,
            test_count: lastExec ? lastExec.testsTotal : 0,
            conclusion: lastExec
              ? lastExec.testsFailed === 0
                ? "success"
                : "failure"
              : "",
            tddExecutions: execs,
          };
        },
      );
      return {
        branch: branchData,
        commits,
      };
    } catch (error) {
      console.error("Error getting branch history:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  private async getBranchRowByName(
    repositorySlug: string,
    branchName: string,
  ): Promise<any | null> {
    const repo = await this.getRepository(repositorySlug);
    if (!repo) {
      return null;
    }
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT id, name, fork_commit_sha, created_at, repo_id FROM tdd_branch
        WHERE repo_id = $1 AND name = $2
      `;
      const values = [repo.slug, branchName];
      const result = await client.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error getting branch row by name from tdd_branch:", error);
      throw error;
    } finally {
      client.release();
    }
  }
}
