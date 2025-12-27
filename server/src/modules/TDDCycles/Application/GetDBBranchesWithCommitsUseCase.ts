import { IDBBranchWithCommits } from "../Domain/IDBBranchWithCommits";
import { IFirebaseDBBranchesCommitsRepository } from "../Domain/IFirebaseDBBranchesCommitsRepository";

export class GetDBBranchesWithCommitsUseCase {
    private repository: IFirebaseDBBranchesCommitsRepository;

    constructor(repository: IFirebaseDBBranchesCommitsRepository) {
        this.repository = repository;
    }

    async execute(owner: string, repoName: string): Promise<IDBBranchWithCommits[]> {
        return await this.repository.getBranchesWithCommits(owner, repoName);
    }
}
