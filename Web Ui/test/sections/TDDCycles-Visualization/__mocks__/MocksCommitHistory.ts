import { CommitHistoryRepository } from "../../../../src/modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import { CommitDataObject } from "../../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommitCycle } from "../../../../src/modules/TDDCycles-Visualization/domain/TddCycleInterface";
import { TDDLogEntry } from "../../../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import { IDBBranchWithCommits } from "../../../../src/modules/TDDCycles-Visualization/domain/IDBBranchWithCommits";

// Mock implementation of IDBCommit, compatible with frontend needs
const mockIDBCommitArray = [
  {
    sha: "dd4ca82ccf990f55ecc1ea94c75d114ea05a39ff",
    branch: "main",
    repo_name: "parcel_jest_base_TDD",
    user_id: "FranAliss",
    author: "FranAliss",
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "Todos los tests del mundo",
      url: "https://api.github.com/repos/FranAliss/parcel_jest_base_TDD/git/commits/dd4ca82ccf990f55ecc1ea94c75d114ea05a39ff",
    },
    stats: {
      total: 72,
      additions: 36,
      deletions: 36,
      date: "2023-10-07",
    },
    coverage: 100,
    test_count: 0,
    failed_tests: 0,
    conclusion: "success",
    // html_url is part of CommitDataObject, not IDBCommit, so exclude or add mock if needed
  },
  {
    sha: "bad4bac7433175ff06c083930599e96f46eafcde",
    branch: "main",
    repo_name: "parcel_jest_base_TDD",
    user_id: "FranAliss",
    author: "FranAliss",
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "This commit failed",
      url: "https://api.github.com/repos/FranAliss/parcel_jest_base_TDD/git/commits/bad4bac7433175ff06c083930599e96f46eafcde",
    },
    stats: {
      total: 30,
      additions: 20,
      deletions: 10,
      date: "2023-10-07",
    },
    coverage: 45.0,
    test_count: 5,
    failed_tests: 1,
    conclusion: "failure",
  }
];


export class MockGithubAPI implements CommitHistoryRepository {
  async obtainUserName(_owner: string): Promise<string> {
    return "mockUser";
  }

  async obtainCommitsOfRepo(_owner: string, _repoName: string): Promise<CommitDataObject[]> {
    // This method still returns CommitDataObject[], so convert
    return mockIDBCommitArray.map(commit => ({
        html_url: commit.commit.url, // Assuming html_url maps to commit.url
        sha: commit.sha,
        stats: commit.stats,
        commit: {
            date: commit.commit.date,
            message: commit.commit.message,
            url: commit.commit.url,
            comment_count: 0 // Assuming default
        },
        coverage: commit.coverage,
        test_count: commit.test_count,
        conclusion: commit.conclusion,
        // Missing fields like branch, repo_name, user_id, author are not in CommitDataObject
    }));
  }

  async obtainCommitTddCycle(_owner: string, _repoName: string): Promise<CommitCycle[]> {
    let commitCycles: CommitCycle[] = [];
    return commitCycles;
  }

  async obtainTDDLogs(_owner: string, _repoName: string): Promise<TDDLogEntry[]> {
    let tddLogs: TDDLogEntry[] = [];
    return tddLogs;
  }

  async obtainBranchesWithCommits(_owner: string, _repoName: string): Promise<IDBBranchWithCommits[]> {
    return [
      {
        _id: "mockBranchId1",
        user_id: "mockOwner",
        repo_name: "mockRepo",
        branch_name: "main",
        commits: mockIDBCommitArray, // Use the IDBCommit compliant mock data
        last_commit: "mockSha1",
        updated_at: new Date()
      },
      {
        _id: "mockBranchId2",
        user_id: "mockOwner",
        repo_name: "mockRepo",
        branch_name: "feature/test",
        commits: [],
        last_commit: "mockSha2",
        updated_at: new Date()
      }
    ];
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

  async obtainTDDLogs(_owner: string, _repoName: string): Promise<TDDLogEntry[]> {
    let tddLogs: TDDLogEntry[] = [];
    return tddLogs;
  }

  async obtainBranchesWithCommits(_owner: string, _repoName: string): Promise<IDBBranchWithCommits[]> {
    return [];
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

  async obtainTDDLogs(_owner: string, _repoName: string): Promise<TDDLogEntry[]> {
    throw new Error("no TDD logs");
  }

  async obtainBranchesWithCommits(_owner: string, _repoName: string): Promise<IDBBranchWithCommits[]> {
    throw new Error("Error obtaining branches with commits");
  }
}

export const mockGithubAPI = new MockGithubAPI();
