import { CommitHistoryRepository } from "../../../../src/modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import {
  CommitDataObject,
  CommitHistoryDTO,
} from "../../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import {
  CommitCycleDTO,
} from "../../../../src/modules/TDDCycles-Visualization/domain/TddCycleInterface";
import { TDDLogEntry } from "../../../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import { CommitData, mockCommitDataArray } from "./dataTypeMocks/commitData";

const MOCK_REPOSITORY_SLUG = "mock-user/tdd-demo";
const MOCK_BRANCH = "main";

// Función para convertir CommitData al formato CommitDataObject para mantener compatibilidad
export function convertToCommitDataObject(commitData: CommitData): CommitDataObject {
  return {
    html_url: commitData.html_url || "",
    sha: commitData.sha,
    stats: {
      total: commitData.stats.total,
      additions: commitData.stats.additions,
      deletions: commitData.stats.deletions,
    },
    commit: {
      date: commitData.commit.date,
      message: commitData.commit.message,
      url: commitData.commit.url,
      comment_count: commitData.commit.comment_count || 0,
    },
    coverage: commitData.coverage,
    test_count: commitData.test_count,
    conclusion: commitData.conclusion,
  };
}

function convertToCommitHistoryDTO(commitData: CommitData): CommitHistoryDTO {
  const successful = commitData.conclusion === "success";

  return {
    ...convertToCommitDataObject(commitData),
    repository_slug: MOCK_REPOSITORY_SLUG,
    branch: MOCK_BRANCH,
    author: commitData.author,
    tests_passed: successful ? commitData.test_count : 0,
    tests_failed: successful ? 0 : commitData.test_count,
  };
}

export class MockGithubAPI implements CommitHistoryRepository {
  async obtainUserName(): Promise<string> {
    return "mockUser";
  }

  async obtainCommitsOfRepo(): Promise<CommitHistoryDTO[]> {
    return mockCommitDataArray.map(convertToCommitHistoryDTO);
  }

  async obtainCommitTddCycle(): Promise<CommitCycleDTO[]> {
    const commitCycles: CommitCycleDTO[] = [];
    return commitCycles;
  }

  async obtainTDDLogs(): Promise<TDDLogEntry[]> {
    const tddLogs: TDDLogEntry[] = [];
    return tddLogs;
  }
}

export class MockGithubAPIEmpty implements CommitHistoryRepository {
  async obtainCommitsOfRepo(): Promise<CommitHistoryDTO[]> {
    const commits: CommitHistoryDTO[] = [];
    return commits;
  }

  async obtainUserName(): Promise<string> {
    return "";
  }

  async obtainCommitTddCycle(): Promise<CommitCycleDTO[]> {
    const commitCycles: CommitCycleDTO[] = [];
    return commitCycles;
  }

  async obtainTDDLogs(): Promise<TDDLogEntry[]> {
    const tddLogs: TDDLogEntry[] = [];
    return tddLogs;
  }
}

export class MockGithubAPIError implements CommitHistoryRepository {
  async obtainCommitsOfRepo(): Promise<CommitHistoryDTO[]> {
    throw new Error("no commits");
  }

  async obtainUserName(): Promise<string> {
    throw new Error("no username");
  }

  async obtainCommitTddCycle(): Promise<CommitCycleDTO[]> {
    throw new Error("no commit cycles");
  }

  async obtainTDDLogs(): Promise<TDDLogEntry[]> {
    throw new Error("no TDD logs");
  }
}

export const mockGithubAPI = new MockGithubAPI();
