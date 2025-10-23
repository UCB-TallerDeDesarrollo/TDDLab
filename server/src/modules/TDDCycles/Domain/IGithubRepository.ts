import { TDDCycleDataObject } from "./TDDCycleDataObject";
import { CommitDataObject, CommitInformationDataObject } from "./CommitDataObject";
import { JobDataObject } from "./JobDataObject";

import { CommitCycleData } from "./ICommitCycleData";
import { CommitHistoryData } from "./ICommitHistoryData";
import { TDDLogEntry } from "./ITDDLogEntry";

export interface IGithubRepository {
    getCommits(owner: string, repoName: string): Promise<CommitDataObject[]>;
    getCommitInfoForTDDCycle(owner: string, repoName: string, sha: string): Promise<CommitInformationDataObject>;
    timeout(ms: number): Promise<void>;
    obtainRunsOfGithubActions(owner: string, repoName: string): Promise<any>;
    obtainJobsOfACommit(owner: string, repoName: string, jobId: number, attempt: number): Promise<any>;
    getRunsOfGithubActionsIds(owner: string, repoName: string): Promise<[string, number][]>;
    getJobsDataFromGithub(owner: string, repoName: string, listOfCommitsWithActions: [string, number][]): Promise<Record<string, JobDataObject>>;
    getCommitsInforForTDDCycle(owner: string, repoName: string, commits: CommitDataObject[]): Promise<TDDCycleDataObject[]>;
    fetchCoverageDataForCommit(owner: string, repoName: string, sha: string): Promise<any>;
    fetchCommitHistoryJson(owner: string, repoName: string): Promise<any[]>;
    getCommitHistoryData(owner: string, repoName: string): Promise<CommitHistoryData[]>;
    getCommitCyclesData(owner: string, repoName: string): Promise<CommitCycleData[]>;
    obtainTDDLogs(owner: string, repoName: string): Promise<TDDLogEntry[]>;
}