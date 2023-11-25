import { Pool } from 'pg';
import { JobDB } from './JobDataObject';
import { JobDataObject } from './jobInterfaces';

export interface IDBJobsRepository {
    pool: Pool;
    getJobs(owner: string, repo: string): Promise<any>;
    checkIfJobExistsInDb(owner: string, repo: string, jobId: number): Promise<any>;
    saveJob(job: JobDB): Promise<void>;
    repositoryExists(owner: string, repoName: string): Promise<boolean>;
    getJobsNotSavedInDB(owner: string, repoName: string, commitsWithActions: [string, number][]): Promise<[string, number][]>;
    saveJobsToDB(owner: string, repoName: string, jobs: Record<string, JobDataObject>): Promise<void>;
}