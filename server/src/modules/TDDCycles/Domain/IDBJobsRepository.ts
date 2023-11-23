import { Pool } from 'pg';
import { JobDB } from './JobDataObject';

export interface IDBJobsRepository {
    pool: Pool;
    getJobs(owner: string, repo: string): Promise<any>;
    checkIfJobExistsInDb(owner: string, repo: string, jobId: number): Promise<any>;
    saveJob(job: JobDB): Promise<void>;
    repositoryExists(owner: string, repoName: string): Promise<boolean>;
}