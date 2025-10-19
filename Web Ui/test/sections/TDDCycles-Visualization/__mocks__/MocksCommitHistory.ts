import { ComplexityObject } from "../../../../src/modules/TDDCycles-Visualization/domain/ComplexityInterface";
import { CommitHistoryRepository } from "../../../../src/modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import { CommitDataObject } from "../../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommitCycle } from "../../../../src/modules/TDDCycles-Visualization/domain/TddCycleInterface";
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
  async obtainCommitsOfRepo(_owner: string, _repoName: string): Promise<CommitDataObject[]> {
    // Convertimos nuestros datos al formato esperado por la interfaz
    return mockCommitDataArray.map(convertToCommitDataObject);
  }

  async obtainUserName(_owner: string): Promise<string> {
    return "MockUsername";
  }

  async obtainComplexityOfRepo(_owner: string, _repoName: string): Promise<ComplexityObject[]> {
    let complexity: ComplexityObject[] = [];
    return complexity;
  }

  async obtainCommitTddCycle(_owner: string, _repoName: string): Promise<CommitCycle[]> {
    let commitCycles: CommitCycle[] = [];
    return commitCycles;
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

  async obtainComplexityOfRepo(_owner: string, _repoName: string): Promise<ComplexityObject[]> {
    let complexity: ComplexityObject[] = [];
    return complexity;
  }

  async obtainCommitTddCycle(_owner: string, _repoName: string): Promise<CommitCycle[]> {
    let commitCycles: CommitCycle[] = [];
    return commitCycles;
  }
}

export class MockGithubAPIError implements CommitHistoryRepository {
  async obtainCommitsOfRepo(_owner: string, _repoName: string): Promise<CommitDataObject[]> {
    throw new Error("no commits");
  }

  async obtainUserName(_owner: string): Promise<string> {
    throw new Error("no username");
  }

  async obtainComplexityOfRepo(_owner: string, _repoName: string): Promise<ComplexityObject[]> {
    throw new Error("no complexity");
  }

  async obtainCommitTddCycle(_owner: string, _repoName: string): Promise<CommitCycle[]> {
    throw new Error("no commit cycles");
  }
}