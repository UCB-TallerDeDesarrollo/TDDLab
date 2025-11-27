import { Octokit } from "octokit";
import { CommitDataObject } from "../domain/githubCommitInterfaces.ts";
//import { GithubAPIRepository } from "../domain/GithubAPIRepositoryInterface.ts";
import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface.ts";
import { CommitCycle } from "../domain/TddCycleInterface.ts";
import axios from "axios";
import { VITE_API } from "../../../../config.ts";
import { TDDLogEntry } from "../domain/TDDLogInterfaces.ts";
import { ProcessedTDDLogs } from "../domain/ProcessedTDDLogInterfaces";

export class CommitHistoryAdapter implements CommitHistoryRepository {
  octokit: Octokit;
  backAPI: string;

  constructor() {
    this.octokit = new Octokit();
    //auth: 'coloca tu token github para mas requests'
    this.backAPI = VITE_API + "/TDDCycles"; // https://localhost:3000/api/ -> https://tdd-lab-api-gold.vercel.app/api/
  }
  

  // function for obtain TDD_log.json
  private getTDDLogUrl(owner: string, repoName: string): string {
    return `https://raw.githubusercontent.com/${owner}/${repoName}/main/script/tdd_log.json`;
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

  async obtainCommitsOfRepo(
    owner: string,
    repoName: string,
  ): Promise<CommitDataObject[]> {
    try {
      // Now request our backend endpoint which centralizes this logic
      const url = `${this.backAPI}/commits-history`;
      const response = await axios.get(url, { params: { owner, repoName } });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Backend already returns the mapped array, just ensure dates are Date objects on client
      const commits: CommitDataObject[] = (response.data || []).map((c: any) => ({
        ...c,
        commit: {
          ...c.commit,
          date: new Date(c.commit.date),
        },
      }));
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
      const response = await axios.get(url, { params: { owner, repoName } });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Map server shape to current UI Contract (note: UI uses property tddCycle)
      const commits: CommitCycle[] = (response.data || []).map((item: any) => ({
        url: item.url,
        sha: item.sha,
        tddCycle: item.tddCycle ?? "null",
        coverage: item.coverage,
      }));
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
    try {
      const tddLogUrl = this.getTDDLogUrl(owner, repoName);
      const response = await axios.get<TDDLogEntry[]>(tddLogUrl);

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.data;

    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.warn("Archivo de tdd_log.json no encontrado. Continuando sin datos de registro.");
        return [];
      }
      console.error("Error al obtener tdd_log.json:", error);
      throw error;
    }
  }

  async obtainProcessedTDDLogs(
    owner: string,
    repoName: string,
  ): Promise<ProcessedTDDLogs> {
    try {
      const apiUrl = `http://localhost:3000/api/TDDCycles/tdd-logs?owner=${owner}&repoName=${repoName}`;

      const response = await axios.get<ProcessedTDDLogs>(apiUrl);

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error("Error obtaining processed TDD logs:", error);
      throw error;
    }
  }
}