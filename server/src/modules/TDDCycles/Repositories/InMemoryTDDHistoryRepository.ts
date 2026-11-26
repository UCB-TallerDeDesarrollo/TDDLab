import { isDeepStrictEqual } from "node:util";
import {
  InvalidTDDHistoryBatchError,
} from "../Domain/TDDHistory";
import type { ITDDHistoryRepository } from "../Domain/ITDDHistoryRepository";
import { mergeCommit, mergeExecution, valid, validateBatch } from "../Domain/TDDHistoryWriteRules";
import type {
  BranchRecord,
  CommitRecord,
  ExecutionFilter,
  RepositoryKey,
  SaveSummary,
  TDDHistoryBatch,
  TestExecutionRecord,
} from "../Domain/TDDHistory";

interface RepositoryState {
  repository: RepositoryKey;
  branches: Map<string, BranchRecord>;
  commits: Map<string, CommitRecord>;
  branchCommits: Map<string, Set<string>>;
  executions: Map<string, TestExecutionRecord>;
}

function keyOf(repository: RepositoryKey): string {
  return JSON.stringify([
    repository.provider,
    repository.owner,
    repository.name,
  ]);
}

/**
 * Fake funcional con estado privado por instancia.
 * Trabaja sobre una copia y publica el estado solo cuando todo el lote
 * es válido. saveBatch no realiza I/O ni suspende su ejecución entre pasos.
 * No consulta GitHub/SQL ni actualiza HEAD.
 */
export class InMemoryTDDHistoryRepository implements ITDDHistoryRepository {
  private readonly repositories = new Map<string, RepositoryState>();

  async saveBatch(input: TDDHistoryBatch): Promise<SaveSummary> {
    validateBatch(input);
    // Copia de entrada: evita referencias externas y normaliza los objetos
    // antes de comparar (también cuando provienen de otro contexto JS).
    const batch = structuredClone(input);
    const key = keyOf(batch.repository);
    const previous = this.repositories.get(key);
    const draft: RepositoryState = structuredClone(
      previous ?? {
        repository: batch.repository,
        branches: new Map(),
        commits: new Map(),
        branchCommits: new Map(),
        executions: new Map(),
      },
    );
    const summary = {
      repositoryCreated: previous === undefined,
      branchesAdded: 0,
      commitsAdded: 0,
      commitsUpdated: 0,
      relationsAdded: 0,
      executionsAdded: 0,
      executionsUpdated: 0,
    };

    for (const branch of batch.branches) {
      if (!draft.branches.has(branch.name)) {
        draft.branches.set(branch.name, {
          repository: structuredClone(batch.repository),
          name: branch.name,
        });
        draft.branchCommits.set(branch.name, new Set());
        summary.branchesAdded++;
      }
    }
    for (const commit of batch.commits) {
      const existing = draft.commits.get(commit.sha);
      if (!existing) {
        draft.commits.set(commit.sha, structuredClone(commit));
        summary.commitsAdded++;
      } else {
        const merged = mergeCommit(existing, commit);
        if (!isDeepStrictEqual(existing, merged)) {
          draft.commits.set(commit.sha, merged);
          summary.commitsUpdated++;
        }
      }
    }
    for (const relation of batch.branchCommits) {
      const members = draft.branchCommits.get(relation.branchName);
      if (!members || !draft.commits.has(relation.commitSha)) {
        throw new InvalidTDDHistoryBatchError(
          "La relación requiere una rama y un commit registrados",
        );
      }
      if (!members.has(relation.commitSha)) {
        members.add(relation.commitSha);
        summary.relationsAdded++;
      }
    }

    for (const execution of batch.executions) {
      const existing = draft.executions.get(execution.eventId);
      if (!existing) {
        valid(
          execution.associatedCommitSha === null ||
            draft.commits.has(execution.associatedCommitSha),
          "El commit asociado debe existir en el mismo repositorio",
        );
        draft.executions.set(execution.eventId, structuredClone(execution));
        summary.executionsAdded++;
        continue;
      }
      const merged = mergeExecution(existing, execution);
      valid(
        merged.associatedCommitSha === null ||
          draft.commits.has(merged.associatedCommitSha),
        "El commit asociado debe existir en el mismo repositorio",
      );
      if (!isDeepStrictEqual(existing, merged)) {
        draft.executions.set(execution.eventId, merged);
        summary.executionsUpdated++;
      }
    }

    this.repositories.set(key, draft);
    return summary;
  }

  async findRepository(
    repository: RepositoryKey,
  ): Promise<RepositoryKey | null> {
    return structuredClone(
      this.repositories.get(keyOf(repository))?.repository ?? null,
    );
  }

  async listBranches(repository: RepositoryKey): Promise<BranchRecord[]> {
    const state = this.repositories.get(keyOf(repository));
    return structuredClone(
      state
        ? [...state.branches.values()].sort((a, b) =>
            a.name.localeCompare(b.name),
          )
        : [],
    );
  }

  async findCommit(
    repository: RepositoryKey,
    sha: string,
  ): Promise<CommitRecord | null> {
    return structuredClone(
      this.repositories.get(keyOf(repository))?.commits.get(sha) ?? null,
    );
  }

  async listBranchCommits(
    repository: RepositoryKey,
    branchName: string,
  ): Promise<CommitRecord[]> {
    const state = this.repositories.get(keyOf(repository));
    if (!state) return [];
    const commits = [...(state.branchCommits.get(branchName) ?? [])].map(
      (sha) => state.commits.get(sha)!,
    );
    commits.sort(
      (a, b) =>
        (a.committedAt === null ? Infinity : Date.parse(a.committedAt)) -
          (b.committedAt === null ? Infinity : Date.parse(b.committedAt)) ||
        a.sha.localeCompare(b.sha),
    );
    return structuredClone(commits);
  }

  async listExecutions(
    repository: RepositoryKey,
    filter: ExecutionFilter = { kind: "all" },
  ): Promise<TestExecutionRecord[]> {
    const state = this.repositories.get(keyOf(repository));
    if (!state) return [];
    const executions = [...state.executions.values()].filter((execution) => {
      switch (filter.kind) {
        case "all":
          return true;
        case "captured-in-branch":
          return execution.branchAtCapture === filter.branchName;
        case "in-branch-history":
          return (
            execution.associatedCommitSha !== null &&
            state.branchCommits
              .get(filter.branchName)
              ?.has(execution.associatedCommitSha) === true
          );
        case "associated-with-commit":
          return execution.associatedCommitSha === filter.sha;
      }
    });
    executions.sort(
      (a, b) => a.timestamp - b.timestamp || a.eventId.localeCompare(b.eventId),
    );
    return structuredClone(executions);
  }
}
