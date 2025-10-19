import { Octokit } from "octokit";
import { CommitDataObject } from "../domain/githubCommitInterfaces.ts";
//import { GithubAPIRepository } from "../domain/GithubAPIRepositoryInterface.ts";
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

  async obtainComplexityOfRepo(owner: string, repoName: string) {
    try {
      const repoUrl = `https://github.com/${owner}/${repoName}`;

      // const response = await axios.post("https://api-ccn.vercel.app/analyzeAvgCcn", {
      //   repoUrl,
      // }, {
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });

      // if (response.status !== 200) {
      //   throw new Error(`HTTP error! Status: ${response.status}`);
      // }

      // const responseData = response.data.results;
      // return responseData.map((complexity: any) => ({
      //   ciclomaticComplexity: Math.round(complexity.average_cyclomatic_complexity),
      //   commit: complexity.commit,
      // }));
      return [];
    } catch (error) {
      console.error("Error obtaining complexity data:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Server responded with status:", error.response.status);
        console.error("Server response data:", error.response.data);
      }
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
      console.error("Error obtaining commit TDD cycles:", error);
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

    } catch (error) {
      console.error("Error obtaining TDD logs:", error);
      throw error;
    }
  }
}