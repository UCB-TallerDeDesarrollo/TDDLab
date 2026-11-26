import axios from "axios";
import { VITE_API } from "../../../../config.ts";
import { CommitDataObjectBranchSupport } from "../domain/githubCommitInterfacesBranchSupport";
import { CommitCycleBranchSupport } from "../domain/TddCycleInterfaceBranchSupport";
import { TestExecutionDataBranchSupport } from "../domain/ITestExecutionDataBranchSupport";
import { TopologyGraphResponseBranchSupport } from "../domain/ITopologyGraphBranchSupport";
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
        test_executions: (c.test_executions || []).map((te: any) => ({
          ...te,
          executed_at: new Date(te.executed_at),
        })),
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

  async obtainTestExecutions(
    owner: string,
    repoName: string,
    branch?: string,
    commitSha?: string
  ): Promise<TestExecutionDataBranchSupport[]> {
    try {
      const url = `${this.backAPI}/test-executions`;
      const response = await axios.get(url, {
        params: { owner, repoName, branch, commitSha },
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return (response.data || []).map((te: any) => ({
        ...te,
        executed_at: new Date(te.executed_at),
      }));
    } catch (error) {
      console.error("Error fetching test executions with branch support:", error);
      throw error;
    }
  }

  async obtainTopologyGraph(
    owner: string,
    repoName: string
  ): Promise<TopologyGraphResponseBranchSupport> {
    try {
      const url = `${this.backAPI}/topology`;
      const response = await axios.get(url, {
        params: { owner, repoName },
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = response.data;
      return {
        ...data,
        branches: (data.branches || []).map((b: any) => ({
          ...b,
          created_at: new Date(b.created_at),
          updated_at: new Date(b.updated_at),
        })),
        nodes: (data.nodes || []).map((n: any) => ({
          ...n,
          committed_at: new Date(n.committed_at),
        })),
      };
    } catch (error) {
      console.error("Error fetching topology graph with branch support:", error);
      throw error;
    }
  }
}
