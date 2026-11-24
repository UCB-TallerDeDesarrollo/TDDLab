import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { CommitHistoryDTO } from "../domain/githubCommitInterfaces";
import { CommitCycleDTO } from "../domain/TddCycleInterface";
import {
  CommitLog,
  TDDLogEntry,
  TestExecutionLog,
} from "../domain/TDDLogInterfaces";

const MOCK_OWNER = "mock-user";
const MOCK_REPOSITORY = "tdd-demo";

const REPOSITORY_URL = `https://github.com/${MOCK_OWNER}/${MOCK_REPOSITORY}`;

const AUTHORS = {
  main: "mock-user",
  login: "ana-dev",
  profile: "luis-dev",
  validation: "maria-dev",
};

const createTest = (
  testId: number,
  timestamp: number,
  passed: number,
  failed: number,
): TestExecutionLog => ({
  testId,
  timestamp,
  numPassedTests: passed,
  failedTests: failed,
  numTotalTests: passed + failed,
  success: failed === 0,
});

const createCommitLog = (
  commitId: string,
  commitName: string,
  commitTimestamp: number,
  testId: number,
): CommitLog => ({
  commitId,
  commitName,
  commitTimestamp,
  testId,
});

const MAIN_HEAD_SHA = "b2c3d4e";

const TDD_LOGS: TDDLogEntry[] = [
  // main
  createTest(101, 1795000000000, 2, 1),
  createTest(102, 1795000060000, 3, 0),
  createCommitLog("a1b2c3d", "feat(user): add user entity", 1795000120000, 102),

  createTest(103, 1795000180000, 4, 1),
  createTest(104, 1795000240000, 5, 0),
  createCommitLog(
    MAIN_HEAD_SHA,
    "feat(user): add email validation",
    1795000300000,
    104,
  ),

  // feature/login (desde el head de main)
  createTest(201, 1795001000000, 6, 1),
  createTest(202, 1795001060000, 7, 0),
  createCommitLog(
    "e4f5g6h",
    "feat(auth): implement login validation",
    1795001120000,
    202,
  ),

  // feature/profile (desde el head de main)
  createTest(301, 1795002000000, 7, 1),
  createTest(302, 1795002060000, 8, 0),
  createCommitLog(
    "i7j8k9l",
    "feat(profile): add user profile service",
    1795002120000,
    302,
  ),

  // fix/validation (desde el head de main)
  createTest(401, 1795003000000, 5, 1),
  createTest(402, 1795003060000, 6, 0),
  createCommitLog(
    "m1n2o3p",
    "fix(validation): handle empty email input",
    1795003120000,
    402,
  ),
];

const COMMIT_HISTORY: CommitHistoryDTO[] = [
  // main: el repo viene de un template, no hay commit inicial
  {
    repository_slug: `${MOCK_OWNER}/${MOCK_REPOSITORY}`,
    branch: "main",
    html_url: `${REPOSITORY_URL}/commit/a1b2c3d`,
    sha: "a1b2c3d",
    author: AUTHORS.main,
    stats: {
      total: 38,
      additions: 38,
      deletions: 0,
    },
    commit: {
      date: new Date(1795000120000),
      message: "feat(user): add user entity",
      url: `${REPOSITORY_URL}/commit/a1b2c3d`,
      comment_count: 0,
    },
    coverage: 70,
    test_count: 3,
    tests_passed: 3,
    tests_failed: 0,
    conclusion: "success",
  },
  {
    repository_slug: `${MOCK_OWNER}/${MOCK_REPOSITORY}`,
    branch: "main",
    html_url: `${REPOSITORY_URL}/commit/${MAIN_HEAD_SHA}`,
    sha: MAIN_HEAD_SHA,
    parent_sha: "a1b2c3d",
    author: AUTHORS.main,
    stats: {
      total: 27,
      additions: 24,
      deletions: 3,
    },
    commit: {
      date: new Date(1795000300000),
      message: "feat(user): add email validation",
      url: `${REPOSITORY_URL}/commit/${MAIN_HEAD_SHA}`,
      comment_count: 0,
    },
    coverage: 78,
    test_count: 5,
    tests_passed: 5,
    tests_failed: 0,
    conclusion: "success",
  },

  // ramas creadas a partir del mismo head de main
  {
    repository_slug: `${MOCK_OWNER}/${MOCK_REPOSITORY}`,
    branch: "feature/login",
    html_url: `${REPOSITORY_URL}/commit/e4f5g6h`,
    sha: "e4f5g6h",
    parent_sha: MAIN_HEAD_SHA,
    author: AUTHORS.login,
    stats: {
      total: 32,
      additions: 28,
      deletions: 4,
    },
    commit: {
      date: new Date(1795001120000),
      message: "feat(auth): implement login validation",
      url: `${REPOSITORY_URL}/commit/e4f5g6h`,
      comment_count: 1,
    },
    coverage: 84,
    test_count: 7,
    tests_passed: 7,
    tests_failed: 0,
    conclusion: "success",
  },
  {
    repository_slug: `${MOCK_OWNER}/${MOCK_REPOSITORY}`,
    branch: "feature/profile",
    html_url: `${REPOSITORY_URL}/commit/i7j8k9l`,
    sha: "i7j8k9l",
    parent_sha: MAIN_HEAD_SHA,
    author: AUTHORS.profile,
    stats: {
      total: 56,
      additions: 50,
      deletions: 6,
    },
    commit: {
      date: new Date(1795002120000),
      message: "feat(profile): add user profile service",
      url: `${REPOSITORY_URL}/commit/i7j8k9l`,
      comment_count: 2,
    },
    coverage: 89,
    test_count: 8,
    tests_passed: 8,
    tests_failed: 0,
    conclusion: "success",
  },
  {
    repository_slug: `${MOCK_OWNER}/${MOCK_REPOSITORY}`,
    branch: "fix/validation",
    html_url: `${REPOSITORY_URL}/commit/m1n2o3p`,
    sha: "m1n2o3p",
    parent_sha: MAIN_HEAD_SHA,
    author: AUTHORS.validation,
    stats: {
      total: 24,
      additions: 18,
      deletions: 6,
    },
    commit: {
      date: new Date(1795003120000),
      message: "fix(validation): handle empty email input",
      url: `${REPOSITORY_URL}/commit/m1n2o3p`,
      comment_count: 0,
    },
    coverage: 81,
    test_count: 6,
    tests_passed: 6,
    tests_failed: 0,
    conclusion: "success",
  },
];

const COMMIT_CYCLES: CommitCycleDTO[] = [
  {
    repository_slug: `${MOCK_OWNER}/${MOCK_REPOSITORY}`,
    branch: "main",
    url: `${REPOSITORY_URL}/commit/a1b2c3d`,
    sha: "a1b2c3d",
    tddCycle: "RED -> GREEN -> COMMIT",
    coverage: 70,
  },
  {
    repository_slug: `${MOCK_OWNER}/${MOCK_REPOSITORY}`,
    branch: "main",
    url: `${REPOSITORY_URL}/commit/${MAIN_HEAD_SHA}`,
    sha: MAIN_HEAD_SHA,
    tddCycle: "RED -> GREEN -> COMMIT",
    coverage: 78,
  },
  {
    repository_slug: `${MOCK_OWNER}/${MOCK_REPOSITORY}`,
    branch: "feature/login",
    url: `${REPOSITORY_URL}/commit/e4f5g6h`,
    sha: "e4f5g6h",
    tddCycle: "RED -> GREEN -> COMMIT",
    coverage: 84,
  },
  {
    repository_slug: `${MOCK_OWNER}/${MOCK_REPOSITORY}`,
    branch: "feature/profile",
    url: `${REPOSITORY_URL}/commit/i7j8k9l`,
    sha: "i7j8k9l",
    tddCycle: "RED -> GREEN -> COMMIT",
    coverage: 89,
  },
  {
    repository_slug: `${MOCK_OWNER}/${MOCK_REPOSITORY}`,
    branch: "fix/validation",
    url: `${REPOSITORY_URL}/commit/m1n2o3p`,
    sha: "m1n2o3p",
    tddCycle: "RED -> GREEN -> COMMIT",
    coverage: 81,
  },
];

export class MockCommitHistoryRepository implements CommitHistoryRepository {
  async obtainCommitsOfRepo(
    owner: string,
    repoName: string,
  ): Promise<CommitHistoryDTO[]> {
    return [...COMMIT_HISTORY]
      .sort((a, b) => b.commit.date.getTime() - a.commit.date.getTime())
      .map((commit) => ({
        ...commit,
        commit: { ...commit.commit },
        stats: { ...commit.stats },
      }));
  }

  async obtainUserName(owner: string): Promise<string> {
    if (owner !== MOCK_OWNER) {
      throw new Error(`Mock user not found: ${owner}`);
    }
    return MOCK_OWNER;
  }

  async obtainCommitTddCycle(
    owner: string,
    repoName: string,
  ): Promise<CommitCycleDTO[]> {
    return COMMIT_CYCLES.map((cycle) => ({ ...cycle }));
  }

  async obtainTDDLogs(owner: string, repoName: string): Promise<TDDLogEntry[]> {
    return TDD_LOGS.map((entry) => ({ ...entry }));
  }
}
