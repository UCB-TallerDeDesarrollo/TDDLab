import { CommitHistoryRepository } from "../../../../src/modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import { CommitDataObject } from "../../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommitCycle } from "../../../../src/modules/TDDCycles-Visualization/domain/TddCycleInterface";
// ELIMINAR: import { TDDLogEntry } from "../../../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import { CommitData, mockCommitDataArray } from "./dataTypeMocks/commitData";
import { ProcessedTDDLogs } from "../../../../src/modules/TDDCycles-Visualization/domain/ProcessedTDDLogInterfaces";

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

  async obtainCommitsOfRepo(_owner: string, _repoName: string): Promise<CommitDataObject[]> {
    return mockCommitDataArray.map(convertToCommitDataObject);
  }

  async obtainCommitTddCycle(_owner: string, _repoName: string): Promise<CommitCycle[]> {
    let commitCycles: CommitCycle[] = [];
    return commitCycles;
  }

  // ELIMINAR este método - ya no existe en la interfaz
  // async obtainTDDLogs(_owner: string, _repoName: string): Promise<TDDLogEntry[]> {
  //   let tddLogs: TDDLogEntry[] = [];
  //   return tddLogs;
  // }

  async obtainProcessedTDDLogs(_owner: string, _repoName: string): Promise<ProcessedTDDLogs> {
    // Mock de datos procesados vacío
    const processedTddLogs: ProcessedTDDLogs = {
      commits: [],
      summary: {
        totalCommits: 0,
        totalExecutions: 0
      }
    };
    return processedTddLogs;
  }
}

export class MockGithubAPIEmpty implements CommitHistoryRepository {
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

  // ELIMINAR este método
  // async obtainTDDLogs(_owner: string, _repoName: string): Promise<TDDLogEntry[]> {
  //   let tddLogs: TDDLogEntry[] = [];
  //   return tddLogs;
  // }

  async obtainProcessedTDDLogs(_owner: string, _repoName: string): Promise<ProcessedTDDLogs> {
    const processedTddLogs: ProcessedTDDLogs = {
      commits: [],
      summary: {
        totalCommits: 0,
        totalExecutions: 0
      }
    };
    return processedTddLogs;
  }
}

export class MockGithubAPIError implements CommitHistoryRepository {
  async obtainCommitsOfRepo(_owner: string, _repoName: string): Promise<CommitDataObject[]> {
    throw new Error("no commits");
  }

  async obtainUserName(_owner: string): Promise<string> {
    throw new Error("no username");
  }

  async obtainCommitTddCycle(_owner: string, _repoName: string): Promise<CommitCycle[]> {
    throw new Error("no commit cycles");
  }

  // ELIMINAR este método
  // async obtainTDDLogs(_owner: string, _repoName: string): Promise<TDDLogEntry[]> {
  //   throw new Error("no TDD logs");
  // }

  async obtainProcessedTDDLogs(_owner: string, _repoName: string): Promise<ProcessedTDDLogs> {
    throw new Error("no processed TDD logs");
  }
}

export const mockGithubAPI = new MockGithubAPI();