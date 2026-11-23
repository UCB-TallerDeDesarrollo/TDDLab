import axios from "axios";
import { VITE_API } from "../../../../config.ts";
import { CommitDataObjectBranchSupport } from "../domain/githubCommitInterfacesBranchSupport";
import { CommitCycleBranchSupport } from "../domain/TddCycleInterfaceBranchSupport";
import { CommitHistoryRepositoryBranchSupport } from "../domain/CommitHistoryRepositoryInterfaceBranchSupport";

export class CommitHistoryAdapterBranchSupport implements CommitHistoryRepositoryBranchSupport {
  private readonly backAPI: string;

  constructor() {
    this.backAPI = `${VITE_API}/TDDCyclesBranchSupport`;
  }

  async obtainCommitsOfRepo(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitDataObjectBranchSupport[]> {
    try {
      const url = `${this.backAPI}/commits-history`;
      const response = await axios.get(url, {
        params: { owner, repoName, branch },
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return (response.data || []).map((c: any) => ({
        ...c,
        commit: {
          ...c.commit,
          date: new Date(c.commit.date),
        },
      }));
    } catch (error) {
      console.error("Error fetching commits with branch support:", error);
      throw error;
    }
  }

  async obtainCommitTddCycle(
    owner: string,
    repoName: string,
    branch?: string
  ): Promise<CommitCycleBranchSupport[]> {
    try {
      const url = `${this.backAPI}/commit-cycles`;
      const response = await axios.get(url, {
        params: { owner, repoName, branch },
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching TDD cycles with branch support:", error);
      throw error;
    }
  }

  async obtainProjectBranches(
    owner: string,
    repoName: string
  ): Promise<string[]> {
    try {
      const url = `${this.backAPI}/branches`;
      const response = await axios.get(url, {
        params: { owner, repoName },
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching project branches with branch support:", error);
      throw error;
    }
  }
}
