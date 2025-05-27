import { ComplexityObject } from "../domain/ComplexityInterface";
import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { CommitDataObject } from "../domain/githubCommitInterfaces";
import { CommitCycle } from "../domain/TddCycleInterface";

export class PortGetTDDCycles {
  adapter: CommitHistoryRepository;
  constructor(commitHistoryRepository: CommitHistoryRepository) {
    this.adapter = commitHistoryRepository;
  }

  async obtainCommitsOfRepo(
    owner: string,
    repoName: string,
  ): Promise<CommitDataObject[]> {
    return await this.adapter.obtainCommitsOfRepo(owner, repoName);
  }

  async obtainComplexityData(
    owner: string,
    repoName: string,
  ): Promise<ComplexityObject[]> {
    return await this.adapter.obtainComplexityOfRepo(owner, repoName);
  }

  async obtainCommitTddCycle(
    owner: string,
    repoName: string,
  ): Promise<CommitCycle[]> {
    return await this.adapter.obtainCommitTddCycle(owner, repoName);
  }
  
  // Método auxiliar para determinar el estado de un commit basado en su cobertura
  getCommitStatus(commit: CommitDataObject): { status: string; color: string } {
    if (commit.coverage !== null && commit.coverage !== undefined) {
      return { status: "success", color: "green" };
    } else if (this.containsRefactor(commit.commit.message)) {
      return { status: "refactor", color: "blue" };
    } else {
      return { status: "failed", color: "red" };
    }
  }
  
  // Método auxiliar para verificar si un commit es de refactorización
  containsRefactor(commitMessage: string): boolean {
    const regex = /\brefactor(\w*)\b/i;
    return regex.test(commitMessage);
  }
}

export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} (hora de Bolivia)`;
};