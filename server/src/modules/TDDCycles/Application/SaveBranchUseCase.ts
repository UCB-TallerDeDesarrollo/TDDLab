import { IBranchRepository } from "../Domain/IBranchRepository";
import {
  TddRepositoryRequest,
  TddBranchRequest,
  TddCommitRequest,
  TddMergeRequest,
} from "../Domain/InputModels";

interface SaveBranchInput {
  repository: TddRepositoryRequest;
  branches: TddBranchRequest[];
  commits: TddCommitRequest[];
  merges: TddMergeRequest[];
}

export class SaveBranchUseCase {
  private readonly branchRepository: IBranchRepository;

  constructor(branchRepository: IBranchRepository) {
    this.branchRepository = branchRepository;
  }

  async execute(input: SaveBranchInput): Promise<void> {
    const { repository, branches, commits, merges } = input;

    await this.branchRepository.saveRepository(repository);

    for (const branch of branches) {
      await this.branchRepository.saveBranch(branch);
    }

    for (const commit of commits) {
      await this.branchRepository.saveCommit(commit);
    }

    for (const merge of merges) {
      await this.branchRepository.saveMerge(merge);
    }
  }
}
