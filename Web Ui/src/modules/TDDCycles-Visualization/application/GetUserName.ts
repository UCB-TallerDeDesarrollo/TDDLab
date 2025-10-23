import { CommitHistoryRepository } from "../domain/CommitHistoryRepositoryInterface";

export class GetUserName {
  constructor(private readonly repo: CommitHistoryRepository) {}

  async execute(owner: string): Promise<string> {
    return await this.repo.obtainUserName(owner);
  }
}
