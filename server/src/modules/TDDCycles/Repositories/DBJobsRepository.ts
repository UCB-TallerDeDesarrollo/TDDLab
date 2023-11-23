import { Pool } from "pg";
import config from "../../../config/db";
import { JobDB } from '../Domain/JobDataObject';
import { IJobRepository } from '../Domain/IJobRepository';

export class JobRepository implements IJobRepository {
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
    async repositoryExists(owner: string, repoName: string) {
        const client = await this.pool.connect();
        const query =
            "SELECT COUNT(*) FROM jobsTable WHERE owner = $1 AND reponame = $2";
        const values = [owner, repoName];
        const result = await client.query(query, values);
        client.release();
        return result.rows[0].count > 0;
    }
}