import {
  SyncBranchHistoryUseCase,
  BranchSyncForbiddenError,
} from "../../../../src/modules/TDDCycles/Application/SyncBranchHistoryUseCase";
import { InvalidTDDHistoryBatchError } from "../../../../src/modules/TDDCycles/Domain/TDDHistory";
import { InMemoryTDDHistoryRepository } from "../../../../src/modules/TDDCycles/Repositories/InMemoryTDDHistoryRepository";
import {
  branchSyncMocks,
  mainSyncMock,
} from "../../../__mocks__/TDDCycles/dataTypeMocks/BranchSyncMock";

describe("SyncBranchHistoryUseCase", () => {
  it("normalizes the four DTOs without persisting HEAD metadata and replays them idempotently", async () => {
    const repository = new InMemoryTDDHistoryRepository();
    const save = jest.spyOn(repository, "saveBatch");
    const useCase = new SyncBranchHistoryUseCase(repository);
    for (const fixture of Object.values(branchSyncMocks)) {
      const result = await useCase.execute(fixture, fixture.repository);
      expect(result.headUpdate).toEqual({
        status: "not_applied",
        reason: "HEAD_UPDATES_NOT_SUPPORTED",
      });
      expect(result.schemaVersion).toBe(1);
      expect(result.branch).toBe(fixture.branch.name);
    }
    expect(await repository.listBranches(mainSyncMock.repository)).toHaveLength(
      3,
    );
    expect(
      await repository.listBranchCommits(mainSyncMock.repository, "main"),
    ).toHaveLength(4);
    expect(
      await repository.listExecutions(mainSyncMock.repository),
    ).toHaveLength(3);
    expect(save.mock.calls[0][0]).toEqual({
      repository: mainSyncMock.repository,
      branches: [{ name: "main" }],
      commits: mainSyncMock.commits,
      branchCommits: mainSyncMock.branchCommitShas.map((commitSha) => ({
        branchName: "main",
        commitSha,
      })),
      executions: mainSyncMock.executions,
    });
    expect(
      (await useCase.execute(mainSyncMock, mainSyncMock.repository)).summary,
    ).toEqual({
      repositoryCreated: false,
      branchesAdded: 0,
      commitsAdded: 0,
      commitsUpdated: 0,
      relationsAdded: 0,
      executionsAdded: 0,
      executionsUpdated: 0,
    });
  });

  it("accepts offline metadata and pending associations without inferring capture", async () => {
    const repository = new InMemoryTDDHistoryRepository();
    const fixture = structuredClone(mainSyncMock);
    const body = {
      ...fixture,
      branch: { ...fixture.branch, headSha: null, expectedHeadVersion: null },
      executions: [
        {
          ...fixture.executions[0],
          branchAtCapture: null,
          headShaAtExecution: null,
          associatedCommitSha: null,
        },
      ],
    };
    await new SyncBranchHistoryUseCase(repository).execute(
      body,
      fixture.repository,
    );
    expect(await repository.listExecutions(fixture.repository)).toEqual(
      body.executions,
    );
  });

  it("rejects a token scope belonging to another repository before saving", async () => {
    const saveBatch = jest.fn();
    await expect(
      new SyncBranchHistoryUseCase({ saveBatch }).execute(mainSyncMock, {
        ...mainSyncMock.repository,
        name: "another-repository",
      }),
    ).rejects.toThrow(BranchSyncForbiddenError);
    expect(saveBatch).not.toHaveBeenCalled();
  });

  const invalidBodies: Array<[string, (body: Record<string, any>) => unknown]> =
    [
      ["null", () => null],
      ["schema version", (body) => ({ ...body, schemaVersion: 2 })],
      ["mode", (body) => ({ ...body, mode: "snapshot" })],
      [
        "provider",
        (body) => ({
          ...body,
          repository: { ...body.repository, provider: "gitlab" },
        }),
      ],
      [
        "repository URL as name",
        (body) => ({
          ...body,
          repository: { ...body.repository, name: "https://github.com/a/b" },
        }),
      ],
      ["missing branch", (body) => ({ ...body, branch: undefined })],
      [
        "empty branch",
        (body) => ({ ...body, branch: { ...body.branch, name: " " } }),
      ],
      [
        "mutable HEAD marker",
        (body) => ({ ...body, branch: { ...body.branch, headSha: "HEAD" } }),
      ],
      [
        "missing headSha",
        (body) => ({
          ...body,
          branch: { name: "main", expectedHeadVersion: null },
        }),
      ],
      [
        "negative version",
        (body) => ({
          ...body,
          branch: { ...body.branch, expectedHeadVersion: -1 },
        }),
      ],
      [
        "missing version",
        (body) => ({ ...body, branch: { name: "main", headSha: null } }),
      ],
      [
        "missing relations",
        (body) => ({ ...body, branchCommitShas: undefined }),
      ],
      ["non-array commits", (body) => ({ ...body, commits: {} })],
      ["missing executions", (body) => ({ ...body, executions: undefined })],
      [
        "non-UUID event",
        (body) => ({
          ...body,
          executions: [{ ...body.executions[0], eventId: "legacy-1" }],
        }),
      ],
      [
        "invalid metric origin",
        (body) => ({
          ...body,
          commits: [
            {
              ...body.commits[0],
              metrics: {
                ...body.commits[0].metrics,
                executionEventId: "legacy-1",
              },
            },
          ],
        }),
      ],
      [
        "negative timestamp",
        (body) => ({
          ...body,
          executions: [{ ...body.executions[0], timestamp: -1 }],
        }),
      ],
      [
        "inconsistent counters",
        (body) => ({
          ...body,
          executions: [{ ...body.executions[0], numPassedTests: 99 }],
        }),
      ],
      [
        "missing nullable field",
        (body) => ({
          ...body,
          executions: [
            { ...body.executions[0], coveragePercentage: undefined },
          ],
        }),
      ],
    ];
  it.each(invalidBodies)(
    "rejects %s before accessing storage",
    async (_name, invalid) => {
      const saveBatch = jest.fn();
      await expect(
        new SyncBranchHistoryUseCase({ saveBatch }).execute(
          invalid(structuredClone(mainSyncMock)),
          mainSyncMock.repository,
        ),
      ).rejects.toThrow(InvalidTDDHistoryBatchError);
      expect(saveBatch).not.toHaveBeenCalled();
    },
  );

  it("selects only contract fields instead of forwarding unknown properties to storage", async () => {
    const repository = new InMemoryTDDHistoryRepository();
    const save = jest.spyOn(repository, "saveBatch");
    const body = {
      ...mainSyncMock,
      extra: true,
      executions: mainSyncMock.executions.map((event) => ({
        ...event,
        extra: "ignored",
      })),
      commits: mainSyncMock.commits.map((commit) => ({
        ...commit,
        extra: "ignored",
      })),
    };
    await new SyncBranchHistoryUseCase(repository).execute(
      body,
      body.repository,
    );
    expect(save.mock.calls[0][0].commits).toEqual(mainSyncMock.commits);
    expect(save.mock.calls[0][0].executions).toEqual(mainSyncMock.executions);
  });
});
