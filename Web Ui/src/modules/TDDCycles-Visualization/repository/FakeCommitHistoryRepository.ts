import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { CommitDataObject } from "../domain/githubCommitInterfaces";
import { TDDLogEntry } from "../domain/TDDLogInterfaces";

const date = "2026-11-24T12:00:00Z";
const timestamp = Date.parse(date);
const sha = "f".repeat(40);
const url = `https://github.com/demo/tddlab/commit/${sha}`;
const message = "feat: agrega una prueba";

export class FakeCommitHistoryRepository implements CommitHistoryRepository {
  async obtainUserName() {
    return "Demo TDDLab";
  }

  async obtainCommitsOfRepo(): Promise<CommitDataObject[]> {
    return [{
      sha,
      html_url: url,
      commit: { date: new Date(date), message, url, comment_count: 0 },
      stats: { total: 4, additions: 4, deletions: 0 },
      coverage: 90,
      test_count: 1,
      conclusion: "success",
    }];
  }

  async obtainCommitTddCycle() {
    return [{ sha, url, tddCycle: "TDD" }];
  }

  async obtainTDDLogs(): Promise<TDDLogEntry[]> {
    return [
      { testId: 1, timestamp: timestamp - 1000, numPassedTests: 0, failedTests: 1, numTotalTests: 1, success: false },
      { testId: 1, timestamp: timestamp - 500, numPassedTests: 1, failedTests: 0, numTotalTests: 1, success: true },
      { testId: 1, commitId: sha, commitName: message, commitTimestamp: timestamp },
    ];
  }
}
