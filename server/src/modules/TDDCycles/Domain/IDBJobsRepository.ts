import { Pool } from 'pg';
import { TestResultDataObject } from './TestResultDataObject';
import { JobDataObject } from './JobDataObject';

export interface IDBJobsRepository {
    pool: Pool;
    getJobs(owner: string, repo: string): Promise<any>;
    checkIfJobExistsInDb(owner: string, repo: string, jobId: number): Promise<any>;
    saveJob(job: TestResultDataObject): Promise<void>;
    repositoryExists(owner: string, repoName: string): Promise<boolean>;
    getJobsNotSavedInDB(owner: string, repoName: string, commitsWithActions: [string, number][]): Promise<[string, number][]>;
    saveJobsToDB(owner: string, repoName: string, jobs: Record<string, JobDataObject>): Promise<void>;
}