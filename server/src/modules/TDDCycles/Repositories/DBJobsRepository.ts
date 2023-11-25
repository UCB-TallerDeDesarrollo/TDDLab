import { Pool } from "pg";
import config from "../../../config/db";
import { JobDB } from '../Domain/JobDataObject';
import { IDBJobsRepository } from '../Domain/IDBJobsRepository';
import { JobDataObject } from "../Domain/jobInterfaces";

export class DBJobsRepository implements IDBJobsRepository {
    pool: Pool
    constructor() {
        this.pool = new Pool(config)
    }
    async saveJob(job: JobDB) {
        const client = await this.pool.connect();
        try {
            const { id, sha, owner, reponame, conclusion } = job;
            const query = 'INSERT INTO jobsTable (id, sha, owner, repoName, conclusion) VALUES ($1, $2, $3, $4, $5)';
            const values = [id, sha, owner, reponame, conclusion];
            await client.query(query, values);

        } catch (error) {
            console.error('Error inserting job:', error);
        } finally {
            if (client) {
                client.release();
            }
        }
    }
    async getJobs(owner: string, repo: string) {
        let client;
        try {
            client = await this.pool.connect();
            const query = 'SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2';
            const values = [owner, repo];
            const result = await client.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error en la consulta a la base de datos:', error);
            throw new Error('Error en la consulta a la base de datos');
        } finally {
            if (client) {
                client.release();
            }
        }
    }
    async checkIfJobExistsInDb(owner: string, repo: string, jobId: number) {
        let client;
        try {
            client = await this.pool.connect();
            const query = 'SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2 AND id=$3';
            const values = [owner, repo, jobId];
            const result = await client.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error en la consulta a la base de datos:', error);
            throw new Error('Error en la consulta a la base de datos');
        } finally {
            if (client) {
                client.release();
            }
        }
    }
    async repositoryExists(owner: string, repoName: string): Promise<boolean> {
        const client = await this.pool.connect();
        try {
            const query = "SELECT COUNT(*) FROM jobsTable WHERE owner = $1 AND reponame = $2";
            const values = [owner, repoName];
            const result = await client.query(query, values);
            return result.rows[0].count > 0;
        } catch (error) {
            throw new Error(`Error checking repository existence: ${error}`);
        } finally {
            client.release();
        }
    }
    async getJobsNotSavedInDB(
        owner: string,
        repoName: string,
        commitsWithActions: [string, number][]
    ) {
        let jobsToAdd = [];

        for (const currentJob of commitsWithActions) {
            let row = await this.checkIfJobExistsInDb(
                owner,
                repoName,
                currentJob[1]
            );
            if (row.length != 0) break;
            else jobsToAdd.push(currentJob);
        }
        return jobsToAdd;
    }
    async saveJobsToDB(
        owner: string,
        repoName: string,
        jobs: Record<string, JobDataObject>
    ) {
        let jobsFormatted: JobDB[] = Object.values(jobs).map((job) => ({
            id: job.jobs[0].run_id,
            sha: job.jobs[0].head_sha,
            owner: owner,
            reponame: repoName,
            conclusion: job.jobs[0].conclusion,
        }));

        await Promise.all(
            jobsFormatted.map((job) => this.saveJob(job))
        );
    }
}