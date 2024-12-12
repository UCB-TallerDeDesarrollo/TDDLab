import { Pool } from 'pg';
import { TestResultDataObject } from './TestResultDataObject';
import { JobDataObject } from './JobDataObject';
import { ITimelineEntry } from './ITimelineCommit';

export interface IDBJobsRepository {
    pool: Pool;
    getJobs(owner: string, repo: string): Promise<any>;
    jobExists(owner: string, repo: string, jobId: number): Promise<any>;
    saveJob(job: TestResultDataObject): Promise<void>;
    repositoryExists(owner: string, repoName: string): Promise<boolean>;
    getJobsNotSaved(owner: string, repoName: string, commitsWithActions: [string, number][]): Promise<[string, number][]>;
    saveJobsList(owner: string, repoName: string, jobs: Record<string, JobDataObject>): Promise<void>;
    saveLogs(timeline: ITimelineEntry[]): Promise<void>;
    getCommitExecutions(sha: string, owner: string, repo:string): Promise<any>;
    findJobByCommit(sha: string, owner: string, repoName: string): Promise<any | null>;
    updateJobConclusion(sha: string, repoOwner: string, repoName: string, conclusion: string): Promise<void>;
    saveJobFromTDDLog(job: TestResultDataObject): Promise<void>;
    
}