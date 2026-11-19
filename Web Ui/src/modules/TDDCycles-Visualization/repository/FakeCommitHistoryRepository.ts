import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { CommitDataObject } from "../domain/githubCommitInterfaces";
import { CommitCycle } from "../domain/TddCycleInterface";
import { TDDLogEntry, GitGraphCommit } from "../domain/TDDLogInterfaces";

function safeClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class FakeCommitHistoryRepository implements CommitHistoryRepository {
  private readonly fakeCommits: CommitDataObject[];
  private readonly fakeCycles: CommitCycle[];
  private readonly fakeLogs: TDDLogEntry[];
  private readonly fakeUserName: string;

  constructor() {
    this.fakeUserName = "TDDLab Demo User";

    const baseTime = new Date("2026-11-12T14:00:00.000Z").getTime();
    const sha1 = "a".repeat(40);
    const sha2 = "b".repeat(40);
    const sha3 = "c".repeat(40);
    const sha4 = "d".repeat(40);
    const sha5 = "e".repeat(40);

    const graph: GitGraphCommit[] = [
      { sha: sha5, parents: [sha3, sha4], subject: "merge: integrar descuentos y redondeo", timestamp: baseTime + 240000, historyBranch: "main" },
      { sha: sha3, parents: [sha2], subject: "fix: aplicar el descuento", timestamp: baseTime + 180000, recordedBranches: ["descuentos"] },
      { sha: sha4, parents: [sha1], subject: "feat: redondear importes", timestamp: baseTime + 120000, recordedBranches: ["redondeo"] },
      { sha: sha2, parents: [sha1], subject: "test: registrar el descuento pendiente", timestamp: baseTime + 60000, recordedBranches: ["descuentos"] },
      { sha: sha1, parents: [], subject: "chore: iniciar práctica TDD", timestamp: baseTime, historyBranch: "main" },
    ];

    this.fakeCommits = [
      {
        sha: sha5,
        html_url: `https://github.com/tddlab-demo/branches/commit/${sha5}`,
        stats: { total: 32, additions: 24, deletions: 8 },
        commit: {
          date: new Date(baseTime + 240000),
          message: "merge: integrar descuentos y redondeo",
          url: `https://github.com/tddlab-demo/branches/commit/${sha5}`,
          comment_count: 0,
        },
        coverage: 100,
        test_count: 3,
        conclusion: "success",
      },
      {
        sha: sha3,
        html_url: `https://github.com/tddlab-demo/branches/commit/${sha3}`,
        stats: { total: 14, additions: 12, deletions: 2 },
        commit: {
          date: new Date(baseTime + 180000),
          message: "fix: aplicar el descuento",
          url: `https://github.com/tddlab-demo/branches/commit/${sha3}`,
          comment_count: 0,
        },
        coverage: 100,
        test_count: 2,
        conclusion: "success",
      },
      {
        sha: sha4,
        html_url: `https://github.com/tddlab-demo/branches/commit/${sha4}`,
        stats: { total: 18, additions: 14, deletions: 4 },
        commit: {
          date: new Date(baseTime + 120000),
          message: "feat: redondear importes",
          url: `https://github.com/tddlab-demo/branches/commit/${sha4}`,
          comment_count: 0,
        },
        coverage: 100,
        test_count: 2,
        conclusion: "success",
      },
      {
        sha: sha2,
        html_url: `https://github.com/tddlab-demo/branches/commit/${sha2}`,
        stats: { total: 25, additions: 25, deletions: 0 },
        commit: {
          date: new Date(baseTime + 60000),
          message: "test: registrar el descuento pendiente",
          url: `https://github.com/tddlab-demo/branches/commit/${sha2}`,
          comment_count: 0,
        },
        coverage: 50,
        test_count: 1,
        conclusion: "failure",
      },
    ];

    this.fakeCycles = [
      { sha: sha5, url: `https://github.com/tddlab-demo/branches/commit/${sha5}`, tddCycle: "green" },
      { sha: sha3, url: `https://github.com/tddlab-demo/branches/commit/${sha3}`, tddCycle: "green" },
      { sha: sha4, url: `https://github.com/tddlab-demo/branches/commit/${sha4}`, tddCycle: "green" },
      { sha: sha2, url: `https://github.com/tddlab-demo/branches/commit/${sha2}`, tddCycle: "red" },
    ];

    this.fakeLogs = [
      {
        numPassedTests: 0,
        failedTests: 1,
        numTotalTests: 1,
        timestamp: baseTime + 59000,
        success: false,
        testId: 0,
      },
      {
        commitId: sha2,
        commitName: "test: registrar el descuento pendiente",
        commitTimestamp: baseTime + 60000,
        testId: 0,
        gitGraph: graph,
      },
      {
        numPassedTests: 2,
        failedTests: 0,
        numTotalTests: 2,
        timestamp: baseTime + 119000,
        success: true,
        testId: 1,
      },
      {
        commitId: sha4,
        commitName: "feat: redondear importes",
        commitTimestamp: baseTime + 120000,
        testId: 1,
      },
      {
        numPassedTests: 1,
        failedTests: 0,
        numTotalTests: 1,
        timestamp: baseTime + 179000,
        success: true,
        testId: 2,
      },
      {
        commitId: sha3,
        commitName: "fix: aplicar el descuento",
        commitTimestamp: baseTime + 180000,
        testId: 2,
      },
      {
        commitId: sha5,
        commitName: "merge: integrar descuentos y redondeo",
        commitTimestamp: baseTime + 240000,
        testId: 3,
      },
    ];
  }

  async obtainCommitsOfRepo(_owner: string, _repoName: string, _branch?: string): Promise<CommitDataObject[]> {
    const cloned = safeClone(this.fakeCommits);
    return cloned.map((commit) => ({
      ...commit,
      commit: {
        ...commit.commit,
        date: new Date(commit.commit.date),
      },
    }));
  }

  async obtainUserName(_owner: string): Promise<string> {
    return this.fakeUserName;
  }

  async obtainCommitTddCycle(_owner: string, _repoName: string, _branch?: string): Promise<CommitCycle[]> {
    return safeClone(this.fakeCycles);
  }

  async obtainTDDLogs(_owner: string, _repoName: string, _branch?: string): Promise<TDDLogEntry[]> {
    return safeClone(this.fakeLogs);
  }
}
