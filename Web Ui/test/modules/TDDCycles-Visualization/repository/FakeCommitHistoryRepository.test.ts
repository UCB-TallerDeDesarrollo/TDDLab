import { FakeCommitHistoryRepository } from "../../../../src/modules/TDDCycles-Visualization/repository/FakeCommitHistoryRepository";
import {
  CommitLog,
  TestExecutionLog,
} from "../../../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces";

describe("FakeCommitHistoryRepository", () => {
  let repository: FakeCommitHistoryRepository;

  beforeEach(() => {
    repository = new FakeCommitHistoryRepository();
  });

  describe("obtainUserName", () => {
    it("returns the fake user name regardless of owner argument", async () => {
      const userName = await repository.obtainUserName("any-owner");
      expect(userName).toBe("TDDLab Demo User");
    });
  });

  describe("obtainCommitsOfRepo", () => {
    it("returns the list of fake commits with Date instances", async () => {
      const commits = await repository.obtainCommitsOfRepo("owner", "repo");

      expect(commits).toHaveLength(4);
      expect(commits[0].sha).toBe("e".repeat(40));
      expect(commits[0].commit.message).toBe("merge: integrar descuentos y redondeo");
      expect(commits[0].commit.date).toBeInstanceOf(Date);
      expect(commits[0].stats).toEqual({ total: 32, additions: 24, deletions: 8 });
      expect(commits[0].coverage).toBe(100);
      expect(commits[0].test_count).toBe(3);
      expect(commits[0].conclusion).toBe("success");
    });

    it("returns deep clones to avoid mutation leaks", async () => {
      const commits1 = await repository.obtainCommitsOfRepo("owner", "repo");
      commits1[0].commit.message = "mutated message";
      commits1[0].stats.total = 999;

      const commits2 = await repository.obtainCommitsOfRepo("owner", "repo");
      expect(commits2[0].commit.message).toBe("merge: integrar descuentos y redondeo");
      expect(commits2[0].stats.total).toBe(32);
    });
  });

  describe("obtainCommitTddCycle", () => {
    it("returns the fake commit cycles", async () => {
      const cycles = await repository.obtainCommitTddCycle("owner", "repo");

      expect(cycles).toHaveLength(4);
      expect(cycles[0]).toEqual({
        sha: "e".repeat(40),
        url: `https://github.com/tddlab-demo/branches/commit/${"e".repeat(40)}`,
        tddCycle: "green",
      });
      expect(cycles[3].tddCycle).toBe("red");
    });

    it("returns isolated copies of cycles", async () => {
      const cycles1 = await repository.obtainCommitTddCycle("owner", "repo");
      cycles1[0].tddCycle = "red";

      const cycles2 = await repository.obtainCommitTddCycle("owner", "repo");
      expect(cycles2[0].tddCycle).toBe("green");
    });
  });

  describe("obtainTDDLogs", () => {
    it("returns the fake TDD logs including gitGraph entries", async () => {
      const logs = await repository.obtainTDDLogs("owner", "repo");

      expect(logs).toHaveLength(7);
      const firstExecution = logs[0] as TestExecutionLog;
      expect(firstExecution.failedTests).toBe(1);
      expect(firstExecution.success).toBe(false);

      const commitWithGraph = logs.find(
        (entry): entry is CommitLog => "gitGraph" in entry && Boolean(entry.gitGraph),
      );
      expect(commitWithGraph).toBeDefined();
      expect(commitWithGraph?.gitGraph).toHaveLength(5);
    });

    it("returns isolated copies of logs", async () => {
      const logs1 = await repository.obtainTDDLogs("owner", "repo");
      (logs1[0] as TestExecutionLog).numTotalTests = 999;

      const logs2 = await repository.obtainTDDLogs("owner", "repo");
      expect((logs2[0] as TestExecutionLog).numTotalTests).toBe(1);
    });
  });
});
