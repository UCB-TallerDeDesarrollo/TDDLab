
import axios, { AxiosError } from "axios";

import type {
  CommitHistoryDataBranchSupport,
} from "../Domain/ICommitHistoryDataBranchSupport";

import type {
  CommitCycleDataBranchSupport,
} from "../Domain/ICommitCycleDataBranchSupport";

import type {
  TopologyGraphResponseBranchSupport,
  CommitGraphNodeBranchSupport,
  CommitGraphEdgeBranchSupport,
  BranchSummaryBranchSupport,
} from "../Domain/ITopologyGraphBranchSupport";

type GithubRepo = {
  default_branch: string;
};

type GithubBranch = {
  name: string;
  commit: {
    sha: string;
  };
};

type GithubCommit = {
  sha: string;
  html_url: string;

  commit: {
    message: string;

    author: {
      name?: string;
      email?: string;
      date?: string;
    } | null;

    committer: {
      date?: string;
    } | null;

    comment_count?: number;
  };

  parents: Array<{
    sha: string;
  }>;

  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };

  files?: unknown[];
};

type GithubSnapshot = {
  owner: string;
  repoName: string;
  defaultBranch: string;
  branches: GithubBranch[];
  commits: Map<string, GithubCommit>;
  memberships: Map<string, Set<string>>;
  completeBranches: Set<string>;
};

const CACHE_MS = 5 * 60 * 1000;

const MAX_BRANCHES = 4;

const MAX_COMMITS_PER_BRANCH = 30;

const MAX_DETAILS = process.env.GITHUB_TOKEN ? 8 : 1;

function ghHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;

  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",

    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };
}

async function getGithub<T>(
  path: string,
  params?: Record<string, string | number>
): Promise<T> {
  try {
    const response = await axios.get<T>(
      `https://api.github.com${path}`,
      {
        headers: ghHeaders(),
        params,
        timeout: 15000,
      }
    );

    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    const status = err.response?.status;

    if (status === 403 || status === 429) {
      throw new Error(
        "GitHub limitó las solicitudes. " +
          "Configure GITHUB_TOKEN en el backend " +
          "o reintente más tarde."
      );
    }

    if (status === 404) {
      throw new Error(
        "Repositorio o rama no encontrados en GitHub, " +
          "o repositorio privado sin autorización."
      );
    }

    throw error;
  }
}

class GithubPublicFallbackBranchSupport {
  private readonly cache = new Map<
    string,
    {
      expires: number;
      data: Promise<GithubSnapshot>;
    }
  >();

  private repoPath(
    owner: string,
    repoName: string
  ): string {
    return (
      `/repos/${encodeURIComponent(owner)}/` +
      encodeURIComponent(repoName)
    );
  }

  private async load(
    owner: string,
    repoName: string
  ): Promise<GithubSnapshot> {
    const key =
      `${owner.toLowerCase()}/${repoName.toLowerCase()}`;

    const cached = this.cache.get(key);

    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const request = this.fetchSnapshot(owner, repoName);

    this.cache.set(key, {
      data: request,
      expires: Date.now() + CACHE_MS,
    });

    void request.catch(() => {
      this.cache.delete(key);
    });

    return request;
  }

  private async fetchSnapshot(
    owner: string,
    repoName: string
  ): Promise<GithubSnapshot> {
    const path = this.repoPath(owner, repoName);

    const [repo, branchList] = await Promise.all([
      getGithub<GithubRepo>(path),

      getGithub<GithubBranch[]>(
        `${path}/branches`,
        { per_page: 100 }
      ),
    ]);

    const sortedBranches = [...branchList]
      .sort((a, b) =>
        a.name === repo.default_branch
          ? -1
          : b.name === repo.default_branch
            ? 1
            : a.name.localeCompare(b.name)
      )
      .slice(0, MAX_BRANCHES);

    const commits = new Map<string, GithubCommit>();

    const memberships =
      new Map<string, Set<string>>();

    const completeBranches = new Set<string>();

    for (const branch of sortedBranches) {
      const list = await getGithub<GithubCommit[]>(
        `${path}/commits`,
        {
          sha: branch.name,
          per_page: MAX_COMMITS_PER_BRANCH,
        }
      );

      completeBranches.add(branch.name);

      for (const commit of list) {
        commits.set(commit.sha, commit);

        const previous =
          memberships.get(commit.sha) ??
          new Set<string>();

        previous.add(branch.name);

        memberships.set(commit.sha, previous);
      }
    }

    const detailedShas = [
      ...commits.keys(),
    ].slice(0, MAX_DETAILS);

    for (
      let start = 0;
      start < detailedShas.length;
      start += 5
    ) {
      const chunk = detailedShas.slice(
        start,
        start + 5
      );

      await Promise.all(
        chunk.map(async (sha) => {
          try {
            const detailed =
              await getGithub<GithubCommit>(
                `${path}/commits/${sha}`
              );

            commits.set(sha, detailed);
          } catch (error) {
            console.warn(
              `Unable to load GitHub diff stats for ${sha}:`,
              error
            );
          }
        })
      );
    }

    return {
      owner,
      repoName,
      defaultBranch: repo.default_branch,
      branches: sortedBranches,
      commits,
      memberships,
      completeBranches,
    };
  }

  async branches(
    owner: string,
    repoName: string
  ): Promise<string[]> {
    const snapshot = await this.load(
      owner,
      repoName
    );

    return snapshot.branches.map(
      (branch) => branch.name
    );
  }

  private selected(
    snapshot: GithubSnapshot,
    branch?: string
  ): GithubCommit[] {
    const requested = branch?.trim();

    const all =
      requested === "all" ||
      requested === "*";

    const effective = all
      ? undefined
      : requested || snapshot.defaultBranch;

    if (
      effective &&
      !snapshot.completeBranches.has(effective)
    ) {
      throw new Error(
        `La rama ${effective} no está en ` +
          "el conjunto de ramas cargadas."
      );
    }

    return [...snapshot.commits.values()]
      .filter(
        (commit) =>
          !effective ||
          snapshot.memberships
            .get(commit.sha)
            ?.has(effective)
      )
      .sort(
        (a, b) =>
          Date.parse(
            b.commit.committer?.date ??
              b.commit.author?.date ??
              ""
          ) -
          Date.parse(
            a.commit.committer?.date ??
              a.commit.author?.date ??
              ""
          )
      );
  }

  async history(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitHistoryDataBranchSupport[]> {
    const snapshot = await this.load(
      owner,
      repoName
    );

    return this.selected(snapshot, branch).map(
      (entry) => {
        const members = [
          ...(snapshot.memberships.get(entry.sha) ??
            []),
        ];

        const date =
          entry.commit.committer?.date ??
          entry.commit.author?.date ??
          new Date(0).toISOString();

        const stats = entry.stats;

        return {
          sha: entry.sha,
          html_url: entry.html_url,

          stats: {
            total: stats?.total ?? 0,
            additions: stats?.additions ?? 0,
            deletions: stats?.deletions ?? 0,
            date,
          },

          commit: {
            date: new Date(date),
            message: entry.commit.message,
            url: entry.html_url,
            comment_count:
              entry.commit.comment_count ?? 0,
          },

          coverage: null,
          test_count: 0,
          conclusion: "unknown",

          branches: members,

          primary_branch:
            branch &&
            branch !== "all" &&
            branch !== "*"
              ? branch
              : members.includes(
                    snapshot.defaultBranch
                  )
                ? snapshot.defaultBranch
                : members[0] ??
                  snapshot.defaultBranch,

          parents: entry.parents.map(
            (parent) => parent.sha
          ),

          test_executions: [],
        };
      }
    );
  }

  async cycles(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitCycleDataBranchSupport[]> {
    const history = await this.history(
      owner,
      repoName,
      branch
    );

    return history.map((commit) => ({
      sha: commit.sha,
      url: commit.html_url,
      tddCycle: "unknown",
      coverage: null,
      branch: commit.primary_branch,
      branches: commit.branches,
    }));
  }

  async topology(
    owner: string,
    repoName: string
  ): Promise<TopologyGraphResponseBranchSupport> {
    const snapshot = await this.load(
      owner,
      repoName
    );

    const nodes: CommitGraphNodeBranchSupport[] =
      [...snapshot.commits.values()].map(
        (entry) => {
          const date =
            entry.commit.committer?.date ??
            entry.commit.author?.date ??
            new Date(0).toISOString();

          return {
            sha: entry.sha,

            author:
              entry.commit.author?.name ??
              "Desconocido",

            author_email:
              entry.commit.author?.email ?? null,

            message: entry.commit.message,

            committed_at: new Date(date),

            additions:
              entry.stats?.additions ?? 0,

            deletions:
              entry.stats?.deletions ?? 0,

            total_changes:
              entry.stats?.total ?? 0,

            changed_files:
              entry.files?.length ?? 0,

            branches: [
              ...(snapshot.memberships.get(
                entry.sha
              ) ?? []),
            ],

            parents: entry.parents.map(
              (parent) => parent.sha
            ),

            test_runs_count: 0,
            latest_conclusion: null,
            latest_coverage: null,
          };
        }
      );

    const edges: CommitGraphEdgeBranchSupport[] =
      nodes.flatMap((node) =>
        node.parents.map(
          (sha, index) => ({
            parent_sha: sha,
            child_sha: node.sha,
            parent_order: index,
          })
        )
      );

    const branches: BranchSummaryBranchSupport[] =
      snapshot.branches.map((branch) => ({
        id: branch.name,
        name: branch.name,

        head_commit_sha: branch.commit.sha,

        fork_commit_sha: null,

        created_at: new Date(0),
        updated_at: new Date(0),

        total_commits: nodes.filter((node) =>
          node.branches.includes(branch.name)
        ).length,

        is_default:
          branch.name === snapshot.defaultBranch,
      }));

    return {
      project_id:
        `github:${owner}/${repoName}`,

      default_branch:
        snapshot.defaultBranch,

      branches,
      nodes,
      edges,
    };
  }
}

export const githubPublicFallback =
  new GithubPublicFallbackBranchSupport();
