import { IDBBranchWithCommits } from "./IDBBranchWithCommits";
import { CommitData } from "./CommitData";
import { TestRunsData } from "./TestRunsData";

export interface IFirebaseDBBranchesCommitsRepository {
    getBranchesWithCommits(owner: string, repoName: string): Promise<IDBBranchWithCommits[]>;
    saveCommit(commitData: CommitData): Promise<void>;
    saveTestRuns(testRunsData: TestRunsData): Promise<void>;
}
