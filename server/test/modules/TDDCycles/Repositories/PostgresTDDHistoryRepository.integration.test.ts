import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import type { BranchSyncData } from "../../../../src/modules/TDDCycles/Application/BranchSyncData";
import {
  InvalidTDDHistoryBatchError,
  TDDHistoryConflictError,
} from "../../../../src/modules/TDDCycles/Domain/TDDHistory";
import type { TDDHistoryBatch } from "../../../../src/modules/TDDCycles/Domain/TDDHistory";
import { InMemoryTDDHistoryRepository } from "../../../../src/modules/TDDCycles/Repositories/InMemoryTDDHistoryRepository";
import { PostgresTDDHistoryRepository } from "../../../../src/modules/TDDCycles/Repositories/PostgresTDDHistoryRepository";
import {
  mainSyncMock,
  branchASyncMock,
  branchBSyncMock,
  mainAfterMergeSyncMock,
} from "../../../__mocks__/TDDCycles/dataTypeMocks/BranchSyncMock";

// Set only for an isolated test database with the tdd_history schema applied.
const connectionString = process.env.TDD_TEST_DATABASE_URL;
const integration = connectionString ? describe : describe.skip;

function toBatch(fixture: BranchSyncData, owner: string): TDDHistoryBatch {
  return {
    repository: { ...fixture.repository, owner },
    branches: [{ name: fixture.branch.name }],
    commits: fixture.commits,
    branchCommits: fixture.branchCommitShas.map((commitSha) => ({
      branchName: fixture.branch.name,
      commitSha,
    })),
    executions: fixture.executions,
  };
}

integration("PostgresTDDHistoryRepository", () => {
  const owner = "integration-" + randomUUID();
  let pool: Pool;
  let postgres: PostgresTDDHistoryRepository;

  beforeAll(() => {
    pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
    postgres = new PostgresTDDHistoryRepository(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  it("preserves and enriches commit metadata, including JSONB metrics", async () => {
    const batch = toBatch(mainSyncMock, owner + "-metadata");
    const commit = batch.commits[0];
    const metrics = commit.metrics;
    if (!metrics) throw new Error("The initial commit fixture must have metrics");
    const partial = {
      ...commit,
      parentShas: null,
      committedAt: null,
      stats: null,
      metrics: { ...metrics, coveragePercentage: null },
    };

    expect(await postgres.saveBatch({ ...batch, commits: [partial] }))
      .toMatchObject({ commitsAdded: 1 });
    expect(await postgres.findCommit(batch.repository, commit.sha)).toEqual(partial);
    expect(await postgres.saveBatch(batch)).toMatchObject({ commitsUpdated: 1 });
    expect(await postgres.saveBatch({ ...batch, commits: [partial] }))
      .toMatchObject({ commitsUpdated: 0 });
    expect(await postgres.findCommit(batch.repository, commit.sha)).toEqual(commit);
  }, 30000);

  it("matches the in-memory repository across a merge, replay and filtered reads", async () => {
    const memory = new InMemoryTDDHistoryRepository();
    const batches = [mainSyncMock, branchASyncMock, branchBSyncMock, mainAfterMergeSyncMock]
      .map((fixture) => toBatch(fixture, owner));
    let relationsAdded = 0;
    for (const batch of [...batches, ...batches]) {
      const summary = await postgres.saveBatch(batch);
      expect(summary).toEqual(await memory.saveBatch(batch));
      relationsAdded += summary.relationsAdded;
    }
    const key = batches[0].repository;
    expect(relationsAdded).toBe(8);
    expect(await postgres.findRepository(key)).toEqual(key);
    expect(await postgres.listBranches(key)).toHaveLength(3);
    expect(await postgres.listBranchCommits(key, "main")).toHaveLength(4);
    expect(await postgres.findCommit(key, mainSyncMock.commits[0].sha)).toEqual(
      await memory.findCommit(key, mainSyncMock.commits[0].sha),
    );
    expect(await postgres.listExecutions(key)).toHaveLength(3);
    for (const filter of [
      { kind: "captured-in-branch", branchName: "main" },
      { kind: "in-branch-history", branchName: "main" },
      { kind: "associated-with-commit", sha: mainSyncMock.commits[0].sha },
    ] as const) {
      expect(await postgres.listExecutions(key, filter)).toEqual(await memory.listExecutions(key, filter));
    }
  }, 30000);

  it("serializes concurrent writes, enriches events and rolls back conflicting batches", async () => {
    const batch = toBatch(mainSyncMock, owner + "-concurrent");
    const key = batch.repository;
    const event = batch.executions[0];
    const pending = { ...batch, executions: [{ ...event, associatedCommitSha: null }] };
    const results = await Promise.all([postgres.saveBatch(pending), postgres.saveBatch(pending)]);
    expect(results.reduce((sum, result) => sum + result.executionsAdded, 0)).toBe(1);
    expect(results.filter((result) => result.repositoryCreated)).toHaveLength(1);
    expect(await postgres.saveBatch(batch)).toMatchObject({ executionsUpdated: 1 });

    await expect(postgres.saveBatch({
      ...batch,
      branches: [{ name: "rollback" }],
      executions: [{ ...event, timestamp: event.timestamp + 1 }],
    })).rejects.toThrow(TDDHistoryConflictError);
    await expect(postgres.saveBatch({
      ...batch,
      commits: [{ ...batch.commits[0], message: batch.commits[0].message + " (conflict)" }],
    })).rejects.toThrow(TDDHistoryConflictError);
    await expect(postgres.saveBatch({
      ...batch,
      branches: [{ name: "invalid" }],
      branchCommits: [{ branchName: "invalid", commitSha: "0".repeat(40) }],
    })).rejects.toThrow(InvalidTDDHistoryBatchError);
    expect(await postgres.listBranches(key)).toEqual([{ repository: key, name: "main" }]);
    expect(await postgres.listExecutions(key)).toEqual([event]);
  }, 30000);
});
