import { CommitHistoryRepository } from "../../../../src/modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import { CommitDataObject } from "../../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommitCycle } from "../../../../src/modules/TDDCycles-Visualization/domain/TddCycleInterface";
import { TDDLogEntry } from "../../../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import { CommitData, mockCommitDataArray } from "./dataTypeMocks/commitData";

// Función para convertir CommitData al formato CommitDataObject para mantener compatibilidad
export function convertToCommitDataObject(commitData: CommitData): CommitDataObject {
  return {
    html_url: commitData.html_url || "", // Aseguramos que nunca sea undefined
    sha: commitData.sha,
    stats: {
      total: commitData.stats.total,
      additions: commitData.stats.additions,
      deletions: commitData.stats.deletions
    },
    commit: {
      date: commitData.commit.date,
      message: commitData.commit.message,
      url: commitData.commit.url,
      comment_count: commitData.commit.comment_count || 0
    },
    coverage: commitData.coverage,
    test_count: commitData.test_count,
    conclusion: commitData.conclusion,
  };
}

export class MockGithubAPI implements CommitHistoryRepository {
  async obtainUserName(_owner: string): Promise<string> {
    return "mockUser";
  }

  async obtainDefaultBranch(): Promise<string> {
    return "main";
  }

  async obtainCommitsOfRepo(_owner: string, _repoName: string): Promise<CommitDataObject[]> {
    return mockCommitDataArray.map(convertToCommitDataObject);
  }

  async obtainCommitTddCycle(_owner: string, _repoName: string): Promise<CommitCycle[]> {
    let commitCycles: CommitCycle[] = [];
    return commitCycles;
  }

  async obtainTDDLogs(_owner: string, _repoName: string): Promise<TDDLogEntry[]> {
    let tddLogs: TDDLogEntry[] = [];
    return tddLogs;
  }
}

export class MockGithubAPIEmpty implements CommitHistoryRepository {
  async obtainDefaultBranch(): Promise<string> {
    return "main";
  }

  async obtainCommitsOfRepo(_owner: string, _repoName: string): Promise<CommitDataObject[]> {
    let commits: CommitDataObject[] = [];
    return commits;
  }

  async obtainUserName(_owner: string): Promise<string> {
    return "";
  }

  async obtainCommitTddCycle(_owner: string, _repoName: string): Promise<CommitCycle[]> {
    let commitCycles: CommitCycle[] = [];
    return commitCycles;
  }

  async obtainTDDLogs(_owner: string, _repoName: string): Promise<TDDLogEntry[]> {
    let tddLogs: TDDLogEntry[] = [];
    return tddLogs;
  }
}

export class MockGithubAPITDDLogsError extends MockGithubAPI {
  async obtainTDDLogs(): Promise<TDDLogEntry[]> {
    throw new Error("no TDD logs");
  }
}

export class MockGithubAPIMasterNoTests extends MockGithubAPI {
  async obtainDefaultBranch(): Promise<string> {
    return "master";
  }
}

export class MockGithubAPIError implements CommitHistoryRepository {
  async obtainDefaultBranch(): Promise<string> {
    throw new Error("no default branch");
  }

  async obtainCommitsOfRepo(_owner: string, _repoName: string): Promise<CommitDataObject[]> {
    throw new Error("no commits");
  }

  async obtainUserName(_owner: string): Promise<string> {
    throw new Error("no username");
  }

  async obtainCommitTddCycle(_owner: string, _repoName: string): Promise<CommitCycle[]> {
    throw new Error("no commit cycles");
  }

  async obtainTDDLogs(_owner: string, _repoName: string): Promise<TDDLogEntry[]> {
    throw new Error("no TDD logs");
  }
}

export const mockGithubAPI = new MockGithubAPI();
