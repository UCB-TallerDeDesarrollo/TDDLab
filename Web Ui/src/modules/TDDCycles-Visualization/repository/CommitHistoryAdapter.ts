import { Octokit } from "octokit";
import { CommitDataObject } from "../domain/githubCommitInterfaces.ts";
import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface.ts";
import { CommitCycle } from "../domain/TddCycleInterface.ts";
import axios from "axios";
import { VITE_API } from "../../../../config.ts";
import { TDDLogEntry } from "../domain/TDDLogInterfaces.ts";

export class CommitHistoryAdapter implements CommitHistoryRepository {
  octokit: Octokit;
  backAPI: string;

  constructor() {
    this.octokit = new Octokit();
    this.backAPI = VITE_API + "/TDDCycles";
  }

  private getTDDLogUrl(
    owner: string,
    repoName: string,
    branch = "main",
  ): string {
    return `https://raw.githubusercontent.com/${owner}/${repoName}/${encodeURIComponent(branch)}/script/tdd_log.json`;
  }

  async obtainUserName(owner: string): Promise<string> {
    try {
      const response = await this.octokit.request(`GET /users/${owner}`);

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.data.name || owner;
    } catch (error) {
      console.error("Error obtaining user name:", error);
      throw error;
    }
  }

  async obtainCommitsOfRepo(
    owner: string,
    repoName: string,
  ): Promise<CommitDataObject[]> {
    try {
      const url = `${this.backAPI}/commits-history`;

      const response = await axios.get(url, {
        params: { owner, repoName },
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const commits: CommitDataObject[] = (response.data || []).map(
        (c: any) => ({
          ...c,
          commit: {
            ...c.commit,
            date: new Date(c.commit.date),
          },
        }),
      );

      return commits;
    } catch (error) {
      console.error("Error obteniendo commits desde GitHub:", error);
      throw error;
    }
  }

  async obtainCommitTddCycle(
    owner: string,
    repoName: string,
  ): Promise<CommitCycle[]> {
    try {
      const url = `${this.backAPI}/commit-cycles`;

      const response = await axios.get(url, {
        params: { owner, repoName },
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const commits: CommitCycle[] = (response.data || []).map(
        (item: any) => ({
          url: item.url,
          sha: item.sha,
          tddCycle: item.tddCycle ?? "null",
          coverage: item.coverage,
        }),
      );

      return commits;
    } catch (error) {
      console.error("Error al obtener los ciclos TDD:", error);
      throw error;
    }
  }

  async obtainTDDLogs(
    owner: string,
    repoName: string,
  ): Promise<TDDLogEntry[]> {
    let response;

    try {
      response = await axios.get<TDDLogEntry[]>(
        this.getTDDLogUrl(owner, repoName),
      );
    } catch (error: any) {
      if (error.response?.status !== 404) {
        throw error;
      }

      // El archivo puede existir en una rama predeterminada distinta de main.
      const repository = await this.octokit.request(
        "GET /repos/{owner}/{repo}",
        {
          owner,
          repo: repoName,
        },
      );

      const branch = repository.data.default_branch;

      if (branch === "main") {
        return [];
      }

      try {
        response = await axios.get<TDDLogEntry[]>(
          this.getTDDLogUrl(owner, repoName, branch),
        );
      } catch (branchError: any) {
        if (branchError.response?.status === 404) {
          return [];
        }

        throw branchError;
      }
    }

    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    if (!Array.isArray(response.data)) {
      throw new Error(
        "Formato inválido de tdd_log.json: se esperaba una lista de registros.",
      );
    }

    return response.data;
  }
}