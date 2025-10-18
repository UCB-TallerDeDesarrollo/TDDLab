import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";
import { ComplexityObject } from "../domain/ComplexityInterface";

export class GetComplexityOfRepo {
  constructor(private readonly repo: CommitHistoryRepository) {}

  async execute(owner: string, repoName: string): Promise<ComplexityObject[]> {
    return await this.repo.obtainComplexityOfRepo(owner, repoName);
  }
}
