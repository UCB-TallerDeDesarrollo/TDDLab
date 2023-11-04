import { Pool } from 'pg';
import { JobDB } from '../Domain/Job';

export interface IJobRepository {
    pool: Pool;
    getJobs(owner: string, repo: string): Promise<any>;
    checkIfJobExistsInDb(owner: string, repo: string, jobId: number): Promise<any>;
    insertRecordsIntoDatabase(records: JobDB[]): Promise<void>;
}