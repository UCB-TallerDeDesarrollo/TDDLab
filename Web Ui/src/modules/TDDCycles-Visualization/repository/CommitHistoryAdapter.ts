import { Octokit } from "octokit";
import { CommitDataObject } from "../domain/githubCommitInterfaces.ts";
//import { GithubAPIRepository } from "../domain/GithubAPIRepositoryInterface.ts";
import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface.ts";
import { CommitCycle } from "../domain/TddCycleInterface.ts";
import axios from "axios";
import { VITE_API } from "../../../../config.ts";

export class CommitHistoryAdapter implements CommitHistoryRepository {
  octokit: Octokit;
  backAPI: string;
  
  constructor() {
    this.octokit = new Octokit();
    //auth: 'coloca tu token github para mas requests'
    this.backAPI = VITE_API + "/TDDCycles"; // https://localhost:3000/api/ -> https://tdd-lab-api-gold.vercel.app/api/
  }
  // Función para generar la URL del historial de commits
  private getCommitHistoryUrl(owner: string, repoName: string): string {
    return `https://raw.githubusercontent.com/${owner}/${repoName}/main/script/commit-history.json`; //en esta parte cambie la dirrecion para poder referencias a el commit-history
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
      // Obtenemos la URL dinámica usando las variables owner y repoName
      const commitHistoryUrl = this.getCommitHistoryUrl(owner, repoName);      
      const response = await axios.get(commitHistoryUrl);
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const commitHistory = response.data;
      const commits: CommitDataObject[] = commitHistory.map((commitData: any) => ({
        html_url: commitData.commit.url,
        sha: commitData.sha,
        stats: {
          total: commitData.stats.total,
          additions: commitData.stats.additions,
          deletions: commitData.stats.deletions,
          date: commitData.stats.date
        },
        commit: {
          date: new Date(commitData.commit.date), 
          message: commitData.commit.message,
          url: commitData.commit.url,
          comment_count: commitData.commit.comment_count, // No esta en mi archivo
        },
        coverage: commitData.coverage,
        test_count: commitData.test_count,
        // Añadimos esta propiedad para compatibilidad con el código existente
        // Representa el estado del commit basado en la cobertura
        conclusion: commitData.conclusion
      }));
      commits.sort((a, b) => b.commit.date.getTime() - a.commit.date.getTime());
      
     
      return commits;
    } catch (error) {
      console.error("Error obteniendo commits desde GitHub:", error);
      throw error;
    }
  }

  async obtainComplexityOfRepo(owner: string, repoName: string) {
  try {
    const repoUrl = `https://github.com/${owner}/${repoName}`;

    const response = await axios.post("https://api-ccn.vercel.app/analyzeAvgCcn", {
      repoUrl,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = response.data.results;
    return responseData.map((complexity: any) => ({
      ciclomaticComplexity: Math.round(complexity.average_cyclomatic_complexity),
      commit: complexity.commit,
    }));
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
      // Obtenemos la URL dinámica usando las variables owner y repoName
      const commitHistoryUrl = this.getCommitHistoryUrl(owner, repoName);      
      const response = await axios.get(commitHistoryUrl);
      
      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const commitHistory = response.data;
      // Procesamos la información del commitHistory para obtener los ciclos TDD
      const commits: CommitCycle[] = commitHistory.map((commitData: any) => ({
        url: commitData.commit.url,
        sha: commitData.sha,
        tddCycle: commitData.tdd_cycle ?? "null", // No esta en mi archivo
        coverage: commitData.coverage // Añadimos la cobertura para compatibilidad
      }));
      return commits;
    } catch (error) {
      console.error("Error obtaining commit TDD cycles:", error);
      throw error;
    }
  }
}