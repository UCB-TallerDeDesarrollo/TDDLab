import { IDBBranchWithCommits } from "./IDBBranchWithCommits";

export interface IFirebaseDBBranchesCommitsRepository {
    getBranchesWithCommits(owner: string, repoName: string): Promise<IDBBranchWithCommits[]>;
}
