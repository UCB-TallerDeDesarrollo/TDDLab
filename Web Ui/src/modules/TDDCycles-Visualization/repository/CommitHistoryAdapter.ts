import { VITE_API } from "../../../../config.ts";
import axios from "axios";
import { Octokit } from "octokit";
import { TDDLogEntry } from "../domain/TDDLogInterfaces.ts";
import { CommitCycle } from "../domain/TddCycleInterface.ts";
import { CommitDataObject } from "../domain/githubCommitInterfaces.ts";
import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface.ts";
import { BackendApiError, BackendErrorResponse, EmptyDataError } from "./BackendDto.ts";

export class CommitHistoryAdapter implements CommitHistoryRepository {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit();
  }

  private getTDDLogUrl(owner: string, repoName: string): string {
    return `https://raw.githubusercontent.com/${owner}/${repoName}/main/script/tdd_log.json`;
  }

  async obtainCommitsOfRepo(
    owner: string,
    repoName: string,
  ): Promise<CommitDataObject[]> {
    try {
      const requestUrl = `${VITE_API}/TDDCycles/commits-history`;
      const requestBody = { params: { owner, repoName } };
      const response = await axios.get<CommitDataObject[]>(requestUrl, requestBody);

      return this.assertNotEmpty(response.data, "historial de commits").map((commit) => ({
        ...commit,
        commit: {
          ...commit.commit,
          date: new Date(commit.commit.date),
        },
      }));
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async obtainCommitTddCycle(
    owner: string,
    repoName: string,
  ): Promise<CommitCycle[]> {
    try {
      const requestUrl = `${VITE_API}/TDDCycles/commit-cycles`;
      const requestBody = { params: { owner, repoName } };
      const response = await axios.get<CommitCycle[]>(requestUrl, requestBody);

      return this.assertNotEmpty(response.data, "TDD Cycles").map((item) => ({
        url: item.url,
        sha: item.sha,
        tddCycle: item.tddCycle ?? "null",
      }));
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async obtainTDDLogs(
    owner: string,
    repoName: string,
  ): Promise<TDDLogEntry[]> {
    try {
      const tddLogUrl = this.getTDDLogUrl(owner, repoName);
      const response = await axios.get<TDDLogEntry[]>(tddLogUrl);

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(
          "Archivo de tdd_log.json no encontrado. Continuando sin datos de registro.",
        );
        return [];
      }

      console.error("Error al obtener tdd_log.json:");
      throw error;
    }
  }

  async obtainUserName(owner: string): Promise<string> {
    try {
      const response = await this.octokit.request(`GET /users/${owner}`);
      const userName = response.data.name;

      return userName || owner;
    } catch (error) {
      console.error(`Error al obtener el username: ${owner}`);
      throw error;
    }
  }

  private handleApiError(error: unknown): never {
    if (axios.isAxiosError<BackendErrorResponse>(error)) {
      const data = error.response?.data;

      if (data?.code) {
        throw new BackendApiError(
          data.detail,
          data.code,
        );
      }

      if (!error.response) {
        throw new BackendApiError(
          "No se pudo conectar con la API del sistema.",
          "NETWORK_ERROR",
        );
      }

      throw new BackendApiError(
        `Petición falló con código: ${error.response.status}.`,
        `HTTP_${error.response.status}`,
      );
    }

    if (error instanceof BackendApiError) {
      throw error;
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Error inesperado.");
  }
  
  private assertNotEmpty<T>(data: T[], resource: string): T[] {
    if (!Array.isArray(data) || data.length === 0) {
      throw new EmptyDataError(resource);
    }
    return data;
  }
}
