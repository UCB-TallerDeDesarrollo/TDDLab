import { Octokit } from "octokit";
import { CommitDataObject } from "../domain/githubCommitInterfaces.ts";
import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface.ts";
import { CommitCycle } from "../domain/TddCycleInterface.ts";
import { VITE_API } from "../../../../config.ts";
import { TDDLogEntry } from "../domain/TDDLogInterfaces.ts";
import { BranchSummary } from "../domain/RepositoryRef.ts";

export class CommitHistoryAdapter implements CommitHistoryRepository {
  private readonly octokit = new Octokit();

  constructor(private readonly apiUrl = VITE_API) {}

  private async query<T>(endpoint: string, owner: string, repoName: string, branch?: string): Promise<T[]> {
    if (!this.apiUrl) {
      throw new Error("Falta configurar VITE_API_URL.");
    }

    const params = new URLSearchParams({ owner, repoName });
    if (branch) params.set("branch", branch);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `${this.apiUrl.replace(/\/$/, "")}/TDDCycles/${endpoint}?${params}`,
        { signal: controller.signal },
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: unknown = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Se esperaba una lista");
      }
      return data;
    } catch {
      throw new Error("No se pudieron cargar los datos TDD desde el servidor.");
    } finally {
      clearTimeout(timeout);
    }
  }

  async obtainUserName(owner: string): Promise<string> {
    try {
      const response = await this.octokit.request(`GET /users/${owner}`);

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const userName = response.data.name;
      return userName || owner; // Retorna el nombre o un mensaje si no está disponible
    } catch (error) {
      console.error("Error obtaining user name:", error);
      throw error;
    }
  }

  async obtainCommitsOfRepo(owner: string, repoName: string, branch?: string): Promise<CommitDataObject[]> {
    type CommitResponse = Omit<CommitDataObject, "commit"> & {
      commit: Omit<CommitDataObject["commit"], "date"> & { date: string };
    };
    const commits = await this.query<CommitResponse>("commits-history", owner, repoName, branch);
    return commits.map((item) => ({
      ...item,
      commit: { ...item.commit, date: new Date(item.commit.date) },
    }));
  }

  async obtainCommitTddCycle(owner: string, repoName: string, branch?: string): Promise<CommitCycle[]> {
    const cycles = await this.query<CommitCycle & { coverage?: number }>("commit-cycles", owner, repoName, branch);
    return cycles.map(({ url, sha, tddCycle, coverage }) => ({
      url, sha, tddCycle: tddCycle ?? "null", coverage,
    }));
  }

  obtainTDDLogs(owner: string, repoName: string, branch?: string): Promise<TDDLogEntry[]> {
    return this.query<TDDLogEntry>("test-log", owner, repoName, branch);
  }

  async obtainBranches(owner: string, repoName: string): Promise<BranchSummary[]> {
    if (!this.apiUrl) {
      throw new Error("Falta configurar VITE_API_URL.");
    }

    const params = new URLSearchParams({ owner, repoName });
    const response = await fetch(
      `${this.apiUrl.replace(/\/$/, "")}/TDDCycles/branches?${params}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !Array.isArray((data as { branches?: unknown }).branches)) {
      throw new Error("Respuesta de ramas inválida");
    }
    return (data as { branches: BranchSummary[] }).branches;
  }
}
