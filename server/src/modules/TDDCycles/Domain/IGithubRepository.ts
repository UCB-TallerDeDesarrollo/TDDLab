import { CommitDataObject, CommitInformationDataObject } from "./commitInterfaces";

export interface IGithubRepository {
    getCommits(owner: string, repoName: string): Promise<CommitDataObject[]>;
    getCommitInfoForTDDCycle(owner: string, repoName: string, sha: string): Promise<CommitInformationDataObject>;
    timeout(ms: number): Promise<void>;
    obtainRunsOfGithubActions(owner: string, repoName: string): Promise<any>;
    obtainJobsOfACommit(owner: string, repoName: string, jobId: number, attempt: number): Promise<any>;
    getRunsOfGithubActionsIds(owner: string, repoName: string): Promise<[string, number][]>;
}