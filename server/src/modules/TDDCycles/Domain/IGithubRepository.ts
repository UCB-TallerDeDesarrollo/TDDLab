import { TDDCycleDataObject } from "./TDDCycleDataObject";
import { CommitDataObject, CommitInformationDataObject } from "./CommitDataObject";

export interface IGithubRepository {
    getCommits(owner: string, repoName: string): Promise<CommitDataObject[]>;
    getCommitInfoForTDDCycle(owner: string, repoName: string, sha: string): Promise<CommitInformationDataObject>;
    timeout(ms: number): Promise<void>;
    obtainRunsOfGithubActions(owner: string, repoName: string): Promise<any>;
    getCommitsInforForTDDCycle(owner: string, repoName: string, commits: CommitDataObject[]): Promise<TDDCycleDataObject[]>;
    fetchCoverageDataForCommit(owner: string, repoName: string, sha: string): Promise<any>;
}