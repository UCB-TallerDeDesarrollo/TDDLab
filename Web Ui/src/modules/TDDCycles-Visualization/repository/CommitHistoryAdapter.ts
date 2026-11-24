import { Octokit } from "octokit";
import { CommitHistoryDTO } from "../domain/githubCommitInterfaces.ts";
import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface.ts";
import { CommitCycleDTO } from "../domain/TddCycleInterface.ts";
import axios from "axios";
import { VITE_API } from "../../../../config.ts";
import { TDDLogEntry } from "../domain/TDDLogInterfaces.ts";
import { getErrorResponseStatus } from "../../../shared/helpers/errorHelpers";

type BackendCommit = Omit<CommitHistoryDTO, "commit"> & {
  commit: Omit<CommitHistoryDTO["commit"], "date"> & { date: string | Date };
};

type BackendCommitCycle = Pick<
  CommitCycleDTO,
  "url" | "sha" | "coverage"
> & { tddCycle?: string | null };

export class CommitHistoryAdapter implements CommitHistoryRepository {
  octokit: Octokit;
  backAPI: string;

  constructor() {
    this.octokit = new Octokit();
    //auth: 'coloca tu token github para mas requests'
    this.backAPI = VITE_API + "/TDDCycles"; // https://localhost:3000/api/ -> https://tdd-lab-api-gold.vercel.app/api/
  }

  private normalizeTDDLogEntry(entry: unknown): TDDLogEntry | null {
    if (!entry || typeof entry !== "object") {
      return null;
    }

    const candidate = entry as Record<string, unknown>;

    if (typeof candidate.commitId === "string") {
      return {
        commitId: candidate.commitId,
        commitName:
          typeof candidate.commitName === "string" ? candidate.commitName : "",
        commitTimestamp:
          typeof candidate.commitTimestamp === "number"
            ? candidate.commitTimestamp
            : 0,
        testId: typeof candidate.testId === "number" ? candidate.testId : 0,
      };
    }

    if (
      typeof candidate.numPassedTests === "number" &&
      typeof candidate.failedTests === "number" &&
      typeof candidate.numTotalTests === "number" &&
      typeof candidate.timestamp === "number" &&
      typeof candidate.success === "boolean" &&
      typeof candidate.testId === "number"
    ) {
      return {
        numPassedTests: candidate.numPassedTests,
        failedTests: candidate.failedTests,
        numTotalTests: candidate.numTotalTests,
        timestamp: candidate.timestamp,
        success: candidate.success,
        testId: candidate.testId,
      };
    }

    return null;
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
  ): Promise<CommitHistoryDTO[]> {
    try {
      // Now request our backend endpoint which centralizes this logic
      const url = `${this.backAPI}/commits-history`;
      const response = await axios.get(url, { params: { owner, repoName } });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Backend already returns the mapped array, just ensure dates are Date objects on client
      const commits: CommitHistoryDTO[] = ((response.data || []) as BackendCommit[]).map(
        (c) => ({
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
  ): Promise<CommitCycleDTO[]> {
    try {
      const url = `${this.backAPI}/commit-cycles`;
      const response = await axios.get(url, { params: { owner, repoName } });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Map server shape to current UI Contract (note: UI uses property tddCycle)
      const commits = ((response.data || []) as BackendCommitCycle[]).map(
        (item) => ({
          url: item.url,
          sha: item.sha,
          tddCycle: item.tddCycle ?? "null",
          coverage: item.coverage,
        }),
      ) as CommitCycleDTO[];
      return commits;
    } catch (error) {
      console.error("Error al obtener los ciclos TDD:", error);
      throw error;
    }
  }

  async obtainTDDLogs(owner: string, repoName: string): Promise<TDDLogEntry[]> {
    try {
      const url = `${this.backAPI}/tdd-logs`;
      const response = await axios.get<unknown>(url, {
        params: { owner, repoName },
      });

      if (response.status === 404) {
        console.warn(
          "Logs TDD no encontrados. Continuando sin datos de registro.",
        );
        return [];
      }

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const payload = Array.isArray(response.data)
        ? response.data
        : ((response.data as { logs?: unknown } | null)?.logs ?? []);

      if (!Array.isArray(payload)) {
        return [];
      }

      return payload
        .map((entry) => this.normalizeTDDLogEntry(entry))
        .filter((entry): entry is TDDLogEntry => entry !== null);
    } catch (error: unknown) {
      if (getErrorResponseStatus(error) === 404) {
        console.warn(
          "Logs TDD no encontrados. Continuando sin datos de registro.",
        );
        return [];
      }
      console.error("Error al obtener los logs TDD:", error);
      throw error;
    }
  }
}
