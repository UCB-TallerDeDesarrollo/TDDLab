import type { BranchSyncData } from "../../../../src/modules/TDDCycles/Application/BranchSyncData";
import type { ITDDHistoryRepository } from "../../../../src/modules/TDDCycles/Domain/ITDDHistoryRepository";
import {
  TDDHistoryBatch,
  InvalidTDDHistoryBatchError,
  TDDHistoryConflictError,
} from "../../../../src/modules/TDDCycles/Domain/TDDHistory";
import { InMemoryTDDHistoryRepository } from "../../../../src/modules/TDDCycles/Repositories/InMemoryTDDHistoryRepository";
import {
  mainSyncMock,
  branchASyncMock,
  branchBSyncMock,
  mainAfterMergeSyncMock,
  branchAExecution,
  initialExecution,
  commitShas,
  repositoryMock,
} from "../../../__mocks__/TDDCycles/dataTypeMocks/BranchSyncMock";

/**
 * Conversión exclusiva de estas pruebas. El puerto recibe un lote del dominio,
 * nunca el DTO de sincronización ni sus metadatos de transporte/HEAD.
 */
function toBatch(fixture: BranchSyncData): TDDHistoryBatch {
  return {
    repository: { ...fixture.repository },
    branches: [{ name: fixture.branch.name }],
    commits: structuredClone(fixture.commits),
    branchCommits: fixture.branchCommitShas.map((commitSha) => ({
      branchName: fixture.branch.name,
      commitSha,
    })),
    executions: structuredClone(fixture.executions),
  };
}

function commitsOnly(fixture: BranchSyncData): TDDHistoryBatch {
  return { ...toBatch(fixture), executions: [] };
}

describe("InMemoryTDDHistoryRepository", () => {
  let repository: ITDDHistoryRepository;

  beforeEach(() => {
    repository = new InMemoryTDDHistoryRepository();
  });

  describe("registro, commits y relaciones", () => {
    it("devuelve null o listas vacías cuando no hay datos", async () => {
      expect(await repository.findRepository(repositoryMock)).toBeNull();
      expect(await repository.listBranches(repositoryMock)).toEqual([]);
      expect(
        await repository.findCommit(repositoryMock, commitShas.initial),
      ).toBeNull();
      expect(
        await repository.listBranchCommits(repositoryMock, "main"),
      ).toEqual([]);
      expect(await repository.listExecutions(repositoryMock)).toEqual([]);
    });

    it("registra un repositorio y sus ramas sin necesitar commits", async () => {
      const batch = {
        ...commitsOnly(mainSyncMock),
        branches: [{ name: "main" }, { name: "rama-a" }],
        commits: [],
        branchCommits: [],
      };
      const summary = await repository.saveBatch(batch);
      expect(await repository.findRepository(repositoryMock)).toEqual(
        repositoryMock,
      );
      expect(await repository.listBranches(repositoryMock)).toEqual([
        { repository: repositoryMock, name: "main" },
        { repository: repositoryMock, name: "rama-a" },
      ]);
      expect(summary.repositoryCreated).toBe(true);
      expect(summary.branchesAdded).toBe(2);
      expect(await repository.saveBatch(batch)).toMatchObject({
        repositoryCreated: false,
        branchesAdded: 0,
      });
    });

    it("almacena un solo commit por repositorio y SHA", async () => {
      const batch = commitsOnly(mainSyncMock);
      expect(await repository.saveBatch(batch)).toMatchObject({
        commitsAdded: 1,
      });
      expect(await repository.saveBatch(batch)).toMatchObject({
        commitsAdded: 0,
        commitsUpdated: 0,
        relationsAdded: 0,
      });
      expect(
        await repository.findCommit(repositoryMock, commitShas.initial),
      ).toEqual(mainSyncMock.commits[0]);
      expect(
        await repository.listBranchCommits(repositoryMock, "main"),
      ).toHaveLength(1);
    });

    it("comparte un commit entre ramas sin duplicarlo", async () => {
      await repository.saveBatch(commitsOnly(mainSyncMock));
      expect(
        await repository.saveBatch(commitsOnly(branchASyncMock)),
      ).toMatchObject({ commitsAdded: 1, relationsAdded: 2 });
      expect(
        (await repository.listBranchCommits(repositoryMock, "main")).map(
          (commit) => commit.sha,
        ),
      ).toEqual([commitShas.initial]);
      expect(
        (await repository.listBranchCommits(repositoryMock, "rama-a")).map(
          (commit) => commit.sha,
        ),
      ).toEqual([commitShas.initial, commitShas.branchA]);
    });

    it("no confunde el catálogo de commits con la pertenencia a la rama", async () => {
      const batch = commitsOnly(branchASyncMock);
      await repository.saveBatch({
        ...batch,
        branchCommits: [
          { branchName: "rama-a", commitSha: commitShas.branchA },
        ],
      });
      expect(
        await repository.findCommit(repositoryMock, commitShas.initial),
      ).not.toBeNull();
      expect(
        (await repository.listBranchCommits(repositoryMock, "rama-a")).map(
          (commit) => commit.sha,
        ),
      ).toEqual([commitShas.branchA]);
    });

    it("acepta relaciones incrementales con commits ya almacenados", async () => {
      await repository.saveBatch(commitsOnly(mainSyncMock));
      await repository.saveBatch({
        ...commitsOnly(mainSyncMock),
        branches: [{ name: "rama-b" }],
        commits: [],
        branchCommits: [
          { branchName: "rama-b", commitSha: commitShas.initial },
        ],
      });
      expect(
        (await repository.listBranchCommits(repositoryMock, "rama-b")).map(
          (commit) => commit.sha,
        ),
      ).toEqual([commitShas.initial]);
      expect(await repository.listBranches(repositoryMock)).toHaveLength(2);
    });
  });

  describe("ejecuciones, sincronización y merge", () => {
    it("guarda ejecuciones con su identidad y contexto original", async () => {
      expect(await repository.saveBatch(toBatch(mainSyncMock))).toMatchObject({
        executionsAdded: 1,
        executionsUpdated: 0,
      });
      expect(await repository.listExecutions(repositoryMock)).toEqual([
        initialExecution,
      ]);
      expect(await repository.listBranches(repositoryMock)).toEqual([
        { repository: repositoryMock, name: "main" },
      ]);
    });

    it("repite sincronizaciones completas sin duplicar ninguna entidad", async () => {
      const fixtures = [
        mainSyncMock,
        branchASyncMock,
        branchBSyncMock,
        mainAfterMergeSyncMock,
      ];
      for (const fixture of fixtures)
        await repository.saveBatch(toBatch(fixture));
      for (const fixture of [...fixtures].reverse()) {
        expect(await repository.saveBatch(toBatch(fixture))).toEqual({
          repositoryCreated: false,
          branchesAdded: 0,
          commitsAdded: 0,
          commitsUpdated: 0,
          relationsAdded: 0,
          executionsAdded: 0,
          executionsUpdated: 0,
        });
      }
      expect(await repository.listBranches(repositoryMock)).toHaveLength(3);
      expect(await repository.listExecutions(repositoryMock)).toHaveLength(3);
      expect(
        await repository.listBranchCommits(repositoryMock, "main"),
      ).toHaveLength(4);
    });

    it("distingue captura en una rama del historial consultado después del merge", async () => {
      for (const fixture of [
        mainSyncMock,
        branchASyncMock,
        branchBSyncMock,
        mainAfterMergeSyncMock,
      ]) {
        await repository.saveBatch(toBatch(fixture));
      }
      expect(
        await repository.listExecutions(repositoryMock, {
          kind: "captured-in-branch",
          branchName: "main",
        }),
      ).toEqual([initialExecution]);
      expect(
        await repository.listExecutions(repositoryMock, {
          kind: "captured-in-branch",
          branchName: "rama-a",
        }),
      ).toEqual([branchAExecution]);
      expect(
        await repository.listExecutions(repositoryMock, {
          kind: "in-branch-history",
          branchName: "main",
        }),
      ).toEqual(mainAfterMergeSyncMock.executions);
      expect(
        await repository.listExecutions(repositoryMock, {
          kind: "in-branch-history",
          branchName: "rama-a",
        }),
      ).toEqual(branchASyncMock.executions);
      expect(
        await repository.listExecutions(repositoryMock, {
          kind: "associated-with-commit",
          sha: commitShas.branchA,
        }),
      ).toEqual([branchAExecution]);
      expect(
        await repository.findCommit(repositoryMock, commitShas.merge),
      ).toMatchObject({
        parentShas: [commitShas.branchA, commitShas.branchB],
        metrics: null,
      });
    });

    it("completa un commit asociado pendiente sin cambiar la captura", async () => {
      const batch = toBatch(branchASyncMock);
      await repository.saveBatch({
        ...batch,
        executions: [{ ...branchAExecution, associatedCommitSha: null }],
      });
      expect(
        await repository.listExecutions(repositoryMock, {
          kind: "in-branch-history",
          branchName: "rama-a",
        }),
      ).toEqual([]);
      expect(
        await repository.saveBatch({
          ...batch,
          commits: [],
          executions: [branchAExecution],
        }),
      ).toMatchObject({ executionsAdded: 0, executionsUpdated: 1 });
      expect(await repository.listExecutions(repositoryMock)).toEqual([
        branchAExecution,
      ]);
    });

    it("ignora null reenviado sin borrar datos conocidos de una ejecución", async () => {
      await repository.saveBatch(toBatch(branchASyncMock));
      await repository.saveBatch({
        ...toBatch(branchASyncMock),
        commits: [],
        executions: [
          {
            ...branchAExecution,
            branchAtCapture: null,
            headShaAtExecution: null,
            associatedCommitSha: null,
            coveragePercentage: null,
            testId: null,
          },
        ],
      });
      expect(
        await repository.listExecutions(repositoryMock, {
          kind: "associated-with-commit",
          sha: commitShas.branchA,
        }),
      ).toEqual([branchAExecution]);
    });

    it("mantiene aislados repositorios con iguales SHA, ramas y eventId", async () => {
      await repository.saveBatch(toBatch(mainSyncMock));
      const other = { ...repositoryMock, owner: "otro-equipo" };
      const otherEvent = { ...initialExecution, branchAtCapture: "otra-rama" };
      await repository.saveBatch({
        ...toBatch(mainSyncMock),
        repository: other,
        branches: [{ name: "otra-rama" }],
        branchCommits: [
          { branchName: "otra-rama", commitSha: commitShas.initial },
        ],
        executions: [otherEvent],
      });
      expect(await repository.listExecutions(repositoryMock)).toEqual([
        initialExecution,
      ]);
      expect(await repository.listExecutions(other)).toEqual([otherEvent]);
      expect(
        await repository.listBranchCommits(repositoryMock, "otra-rama"),
      ).toEqual([]);
      expect(await repository.listBranchCommits(other, "main")).toEqual([]);
      expect(
        await repository.findCommit(other, commitShas.initial),
      ).not.toBeNull();
      expect(await repository.listBranches(other)).toEqual([
        { repository: other, name: "otra-rama" },
      ]);
    });

    it("conserva metadatos antiguos desconocidos y diferencia cero de null", async () => {
      const legacy = {
        ...initialExecution,
        branchAtCapture: null,
        headShaAtExecution: null,
        associatedCommitSha: null,
        timestamp: 0,
        numPassedTests: 0,
        failedTests: 0,
        numTotalTests: 0,
        success: false,
        coveragePercentage: 0,
        testId: null,
      };
      await repository.saveBatch({
        ...toBatch(mainSyncMock),
        commits: [
          {
            ...mainSyncMock.commits[0],
            parentShas: null,
            committedAt: null,
            stats: null,
            metrics: null,
          },
        ],
        executions: [legacy],
      });
      expect(await repository.listExecutions(repositoryMock)).toEqual([legacy]);
      expect(
        await repository.listExecutions(repositoryMock, {
          kind: "captured-in-branch",
          branchName: "main",
        }),
      ).toEqual([]);
      expect(
        await repository.listExecutions(repositoryMock, {
          kind: "in-branch-history",
          branchName: "main",
        }),
      ).toEqual([]);
      expect(
        await repository.findCommit(repositoryMock, commitShas.initial),
      ).toMatchObject({
        parentShas: null,
        committedAt: null,
        stats: null,
        metrics: null,
      });
    });
  });

  describe("integridad, atomicidad y copias defensivas", () => {
    const invalidBatches: Array<
      [string, (batch: TDDHistoryBatch) => TDDHistoryBatch]
    > = [
      [
        "repositorio vacío",
        (b) => ({ ...b, repository: { ...b.repository, owner: "" } }),
      ],
      ["rama vacía", (b) => ({ ...b, branches: [{ name: " " }] })],
      [
        "SHA mutable",
        (b) => ({ ...b, commits: [{ ...b.commits[0], sha: "HEAD" }] }),
      ],
      [
        "padre autorreferente",
        (b) => ({
          ...b,
          commits: [{ ...b.commits[0], parentShas: [commitShas.initial] }],
        }),
      ],
      [
        "padres duplicados",
        (b) => ({
          ...b,
          commits: [
            {
              ...b.commits[0],
              parentShas: [commitShas.branchA, commitShas.branchA],
            },
          ],
        }),
      ],
      [
        "fecha inválida",
        (b) => ({ ...b, commits: [{ ...b.commits[0], committedAt: "ayer" }] }),
      ],
      [
        "estadísticas negativas",
        (b) => ({
          ...b,
          commits: [
            {
              ...b.commits[0],
              stats: { additions: -1, deletions: 0, total: -1 },
            },
          ],
        }),
      ],
      [
        "estadísticas inconsistentes",
        (b) => ({
          ...b,
          commits: [
            {
              ...b.commits[0],
              stats: { additions: 1, deletions: 0, total: 5 },
            },
          ],
        }),
      ],
      [
        "métricas inconsistentes",
        (b) => ({
          ...b,
          commits: [
            {
              ...b.commits[0],
              metrics: { ...b.commits[0].metrics!, numTotalTests: 1 },
            },
          ],
        }),
      ],
      [
        "cobertura de commit fuera de rango",
        (b) => ({
          ...b,
          commits: [
            {
              ...b.commits[0],
              metrics: { ...b.commits[0].metrics!, coveragePercentage: 101 },
            },
          ],
        }),
      ],
      [
        "relación con rama ausente",
        (b) => ({
          ...b,
          branchCommits: [
            { branchName: "ausente", commitSha: commitShas.initial },
          ],
        }),
      ],
      [
        "relación con commit ausente",
        (b) => ({
          ...b,
          branchCommits: [
            { branchName: "main", commitSha: commitShas.branchA },
          ],
        }),
      ],
      [
        "eventId vacío",
        (b) => ({ ...b, executions: [{ ...initialExecution, eventId: "" }] }),
      ],
      [
        "tests negativos",
        (b) => ({
          ...b,
          executions: [{ ...initialExecution, numPassedTests: -1 }],
        }),
      ],
      [
        "tests fraccionarios",
        (b) => ({
          ...b,
          executions: [{ ...initialExecution, numTotalTests: 2.5 }],
        }),
      ],
      [
        "tests superiores al total",
        (b) => ({
          ...b,
          executions: [{ ...initialExecution, numPassedTests: 3 }],
        }),
      ],
      [
        "éxito con fallos",
        (b) => ({
          ...b,
          executions: [
            { ...initialExecution, failedTests: 1, numTotalTests: 3 },
          ],
        }),
      ],
      [
        "timestamp no finito",
        (b) => ({
          ...b,
          executions: [{ ...initialExecution, timestamp: NaN }],
        }),
      ],
      [
        "cobertura de ejecución fuera de rango",
        (b) => ({
          ...b,
          executions: [{ ...initialExecution, coveragePercentage: -1 }],
        }),
      ],
      [
        "testId negativo",
        (b) => ({ ...b, executions: [{ ...initialExecution, testId: -1 }] }),
      ],
      [
        "HEAD de captura mutable",
        (b) => ({
          ...b,
          executions: [{ ...initialExecution, headShaAtExecution: "HEAD" }],
        }),
      ],
      [
        "asociación con commit ausente",
        (b) => ({
          ...b,
          executions: [
            { ...initialExecution, associatedCommitSha: commitShas.branchA },
          ],
        }),
      ],
    ];

    it.each(invalidBatches)(
      "rechaza %s sin crear un repositorio parcial",
      async (_name, invalid) => {
        await expect(
          repository.saveBatch(invalid(toBatch(mainSyncMock))),
        ).rejects.toBeInstanceOf(InvalidTDDHistoryBatchError);
        expect(await repository.findRepository(repositoryMock)).toBeNull();
        expect(await repository.listBranches(repositoryMock)).toEqual([]);
        expect(
          await repository.findCommit(repositoryMock, commitShas.initial),
        ).toBeNull();
        expect(await repository.listExecutions(repositoryMock)).toEqual([]);
      },
    );

    it("rechaza un DTO de sincronización sin confundirlo con el lote del dominio", async () => {
      await expect(
        repository.saveBatch(mainSyncMock as unknown as TDDHistoryBatch),
      ).rejects.toBeInstanceOf(InvalidTDDHistoryBatchError);
      expect(await repository.findRepository(repositoryMock)).toBeNull();
    });

    it("revierte adiciones y enriquecimientos si el último registro es inválido", async () => {
      await repository.saveBatch({
        ...toBatch(mainSyncMock),
        executions: [{ ...initialExecution, coveragePercentage: null }],
      });
      await expect(
        repository.saveBatch({
          ...toBatch(branchASyncMock),
          executions: [
            initialExecution,
            branchAExecution,
            {
              ...branchAExecution,
              eventId: "evento-invalido",
              numTotalTests: -1,
            },
          ],
        }),
      ).rejects.toBeInstanceOf(InvalidTDDHistoryBatchError);
      expect(await repository.listBranches(repositoryMock)).toHaveLength(1);
      expect(
        await repository.findCommit(repositoryMock, commitShas.branchA),
      ).toBeNull();
      expect(await repository.listExecutions(repositoryMock)).toEqual([
        { ...initialExecution, coveragePercentage: null },
      ]);
      expect(
        await repository.listBranchCommits(repositoryMock, "rama-a"),
      ).toEqual([]);
    });

    const eventConflicts: Array<[string, Partial<typeof branchAExecution>]> = [
      ["resultados", { numPassedTests: 1 }],
      ["timestamp", { timestamp: branchAExecution.timestamp + 1 }],
      ["rama de captura", { branchAtCapture: "rama-b" }],
      ["HEAD de captura", { headShaAtExecution: commitShas.branchA }],
      ["commit asociado", { associatedCommitSha: commitShas.initial }],
      [
        "commit asociado incompatible ausente",
        { associatedCommitSha: "a".repeat(40) },
      ],
      ["cobertura conocida", { coveragePercentage: 0 }],
      ["agrupamiento conocido", { testId: 2 }],
    ];

    it.each(eventConflicts)(
      "detecta colisión de eventId por %s y conserva el estado",
      async (_name, change) => {
        await repository.saveBatch(toBatch(branchASyncMock));
        await expect(
          repository.saveBatch({
            ...toBatch(branchBSyncMock),
            executions: [{ ...branchAExecution, ...change }],
          }),
        ).rejects.toBeInstanceOf(TDDHistoryConflictError);
        expect(
          await repository.findCommit(repositoryMock, commitShas.branchB),
        ).toBeNull();
        expect(await repository.listBranches(repositoryMock)).toHaveLength(1);
        expect(
          await repository.listExecutions(repositoryMock, {
            kind: "associated-with-commit",
            sha: commitShas.branchA,
          }),
        ).toEqual([branchAExecution]);
      },
    );

    it("detecta eventos incompatibles dentro del mismo lote", async () => {
      await expect(
        repository.saveBatch({
          ...toBatch(mainSyncMock),
          executions: [
            initialExecution,
            { ...initialExecution, timestamp: initialExecution.timestamp + 1 },
          ],
        }),
      ).rejects.toBeInstanceOf(TDDHistoryConflictError);
      expect(await repository.findRepository(repositoryMock)).toBeNull();
    });

    it("no inventa un HEAD de captura para una ejecución capturada sin HEAD", async () => {
      await repository.saveBatch(toBatch(mainSyncMock));
      await expect(
        repository.saveBatch({
          ...toBatch(mainSyncMock),
          executions: [
            { ...initialExecution, headShaAtExecution: commitShas.initial },
          ],
        }),
      ).rejects.toBeInstanceOf(TDDHistoryConflictError);
      expect(await repository.listExecutions(repositoryMock)).toEqual([
        initialExecution,
      ]);
    });

    it("completa metadatos de commit desconocidos y preserva ceros conocidos", async () => {
      await repository.saveBatch({
        ...toBatch(mainSyncMock),
        commits: [
          {
            ...mainSyncMock.commits[0],
            parentShas: null,
            committedAt: null,
            stats: null,
            metrics: {
              ...mainSyncMock.commits[0].metrics!,
              coveragePercentage: null,
            },
          },
        ],
      });
      expect(await repository.saveBatch(toBatch(mainSyncMock))).toMatchObject({
        commitsAdded: 0,
        commitsUpdated: 1,
      });
      await repository.saveBatch({
        ...toBatch(mainSyncMock),
        commits: [
          {
            ...mainSyncMock.commits[0],
            parentShas: null,
            committedAt: null,
            stats: null,
            metrics: null,
          },
        ],
      });
      expect(
        await repository.findCommit(repositoryMock, commitShas.initial),
      ).toEqual(mainSyncMock.commits[0]);
    });

    it("rechaza cambios incompatibles de un commit ya conocido", async () => {
      await repository.saveBatch(toBatch(mainSyncMock));
      await expect(
        repository.saveBatch({
          ...toBatch(branchASyncMock),
          commits: [
            { ...mainSyncMock.commits[0], message: "Mensaje incompatible" },
          ],
        }),
      ).rejects.toBeInstanceOf(TDDHistoryConflictError);
      expect(await repository.listBranches(repositoryMock)).toHaveLength(1);
      expect(
        await repository.findCommit(repositoryMock, commitShas.initial),
      ).toEqual(mainSyncMock.commits[0]);
    });

    it("detecta datos de commit incompatibles dentro del mismo lote", async () => {
      await expect(
        repository.saveBatch({
          ...toBatch(mainSyncMock),
          commits: [
            mainSyncMock.commits[0],
            {
              ...mainSyncMock.commits[0],
              stats: { additions: 1, deletions: 0, total: 1 },
            },
          ],
        }),
      ).rejects.toBeInstanceOf(TDDHistoryConflictError);
      expect(await repository.findRepository(repositoryMock)).toBeNull();
    });

    it("valida también el resultado de completar métricas parciales", async () => {
      const first = {
        ...mainSyncMock.commits[0],
        metrics: {
          executionEventId: null,
          numPassedTests: 2,
          failedTests: null,
          numTotalTests: null,
          coveragePercentage: null,
          conclusion: null,
        },
      };
      await repository.saveBatch({
        ...commitsOnly(mainSyncMock),
        commits: [first],
      });
      await expect(
        repository.saveBatch({
          ...commitsOnly(mainSyncMock),
          commits: [
            {
              ...first,
              metrics: {
                ...first.metrics,
                numPassedTests: null,
                numTotalTests: 1,
              },
            },
          ],
        }),
      ).rejects.toBeInstanceOf(InvalidTDDHistoryBatchError);
      expect(
        await repository.findCommit(repositoryMock, commitShas.initial),
      ).toEqual(first);
    });

    it("no conserva referencias mutables del lote recibido", async () => {
      const batch = toBatch(mainSyncMock);
      await repository.saveBatch(batch);
      Object.assign(batch.repository, { owner: "modificado" });
      Object.assign(batch.branches[0], { name: "modificada" });
      Object.assign(batch.commits[0], { message: "modificado" });
      Object.assign(batch.commits[0].stats!, { additions: 999 });
      Object.assign(batch.executions[0], { branchAtCapture: "modificada" });
      Object.assign(batch.branchCommits[0], { commitSha: commitShas.merge });
      expect(await repository.findRepository(repositoryMock)).toEqual(
        repositoryMock,
      );
      expect(
        await repository.findCommit(repositoryMock, commitShas.initial),
      ).toEqual(mainSyncMock.commits[0]);
      expect(await repository.listExecutions(repositoryMock)).toEqual([
        initialExecution,
      ]);
      expect(
        await repository.listBranchCommits(repositoryMock, "main"),
      ).toHaveLength(1);
    });

    it("devuelve copias profundas en todas las consultas", async () => {
      await repository.saveBatch(toBatch(branchASyncMock));
      Object.assign((await repository.findRepository(repositoryMock))!, {
        name: "modificado",
      });
      const branches = await repository.listBranches(repositoryMock);
      Object.assign(branches[0].repository, { owner: "modificado" });
      Object.assign(branches[0], { name: "modificada" });
      branches.pop();
      const commit = (await repository.findCommit(
        repositoryMock,
        commitShas.branchA,
      ))!;
      Object.assign(commit.stats!, { total: 999 });
      Object.assign(commit.metrics!, { coveragePercentage: 999 });
      Object.assign(commit.parentShas!, { 0: commitShas.merge });
      const history = await repository.listBranchCommits(
        repositoryMock,
        "rama-a",
      );
      Object.assign(history[0], { message: "modificado" });
      history.pop();
      const executions = await repository.listExecutions(repositoryMock);
      Object.assign(executions[0], { numTotalTests: 999 });
      executions.pop();
      expect(await repository.findRepository(repositoryMock)).toEqual(
        repositoryMock,
      );
      expect(await repository.listBranches(repositoryMock)).toEqual([
        { repository: repositoryMock, name: "rama-a" },
      ]);
      expect(
        await repository.findCommit(repositoryMock, commitShas.branchA),
      ).toEqual(branchASyncMock.commits[1]);
      expect(
        await repository.listBranchCommits(repositoryMock, "rama-a"),
      ).toEqual(branchASyncMock.commits);
      expect(await repository.listExecutions(repositoryMock)).toEqual(
        branchASyncMock.executions,
      );
    });

    it("no comparte estado entre instancias ni pierde lotes iniciados juntos", async () => {
      await Promise.all(
        [
          mainSyncMock,
          branchASyncMock,
          branchBSyncMock,
          mainAfterMergeSyncMock,
        ].map((fixture) => repository.saveBatch(toBatch(fixture))),
      );
      expect(await repository.listExecutions(repositoryMock)).toHaveLength(3);
      expect(
        await repository.listBranchCommits(repositoryMock, "main"),
      ).toHaveLength(4);
      const independent = new InMemoryTDDHistoryRepository();
      expect(await independent.findRepository(repositoryMock)).toBeNull();
    });

    it("ordena lecturas por fecha e identidad sin inferir genealogía", async () => {
      const batch = toBatch(mainAfterMergeSyncMock);
      await repository.saveBatch({
        ...batch,
        commits: [...batch.commits]
          .reverse()
          .map((commit) =>
            commit.sha === commitShas.initial
              ? { ...commit, committedAt: null }
              : commit,
          ),
        branchCommits: [...batch.branchCommits].reverse(),
        executions: [...batch.executions].reverse(),
      });
      expect(
        (await repository.listBranchCommits(repositoryMock, "main")).map(
          (c) => c.sha,
        ),
      ).toEqual([
        commitShas.branchA,
        commitShas.branchB,
        commitShas.merge,
        commitShas.initial,
      ]);
      expect(await repository.listExecutions(repositoryMock)).toEqual(
        batch.executions,
      );
      expect(
        await repository.listExecutions(repositoryMock, {
          kind: "in-branch-history",
          branchName: "ausente",
        }),
      ).toEqual([]);
    });
  });
});
