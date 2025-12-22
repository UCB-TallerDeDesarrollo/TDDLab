import { IDBBranch } from "./IDBBranch";
import { IDBCommit } from "./IDBCommit";

export interface IDBBranchWithCommits extends Omit<IDBBranch, 'commits'> {
    commits: IDBCommit[];
}
