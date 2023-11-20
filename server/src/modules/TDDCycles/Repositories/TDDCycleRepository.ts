import { Pool } from "pg";
import config from "../../../config/db";
import { CommitDTO } from "../Domain/CommitDataObject";
import { ICommitRepository } from "../Domain/ICommitRepository";

import { JobDB } from '../Domain/Job';
import { IJobRepository } from '../Domain/IJobRepository';



export class CommitRepository implements ICommitRepository {
    pool: Pool;
    constructor() {
        this.pool = new Pool(config);
    }
    async saveCommitInfoOfRepo(
        owner: string,
        repoName: string,
        commit: CommitDTO
    ) {
        const client = await this.pool.connect();
        const query =
            "INSERT INTO commitsTable (owner, repoName, html_url, sha, total,additions,deletions,message,url,comment_count,commit_date, coverage) VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10,$11, $12)";
        const values = [
            owner,
            repoName,
            commit.html_url,
            commit.sha,
            commit.stats.total,
            commit.stats.additions,
            commit.stats.deletions,
            commit.commit.message,
            commit.commit.url,
            commit.commit.comment_count,
            commit.commit.date,
            commit.coverage
        ];
        const result = await client.query(query, values);
        client.release();
        return result.rows;
    }
    async getCommits(owner: string, repoName: string) {
        const client = await this.pool.connect();
        const query =
            "SELECT * FROM commitsTable WHERE owner = $1 AND reponame = $2 ORDER BY commit_date DESC";
        const values = [owner, repoName];
        const result = await client.query(query, values);
        client.release();
        return result.rows;
    }
    async commitExists(owner: string, repoName: string, sha: string) {
        const client = await this.pool.connect();
        const query =
            "SELECT * FROM commitstable WHERE owner = $1 AND reponame = $2 AND sha=$3";
        const values = [owner, repoName, sha];
        const result = await client.query(query, values);
        client.release();
        return result.rows;
    }
    async repositoryExist(owner: string, repoName: string) {
        const client = await this.pool.connect();
        const query =
            "SELECT COUNT(*) FROM commitstable WHERE owner = $1 AND reponame = $2";
        const values = [owner, repoName];
        const result = await client.query(query, values);
        client.release();
        return result.rows[0].count > 0;
    }
}


export class JobRepository implements IJobRepository {
    pool: Pool
    constructor() {
        this.pool = new Pool(config)
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
    async checkIfJobExistsInDb(owner: string, repo: string,jobId:number) {
        let client;
        try {
            client = await this.pool.connect();
            const query = 'SELECT * FROM jobsTable WHERE owner = $1 AND reponame = $2 AND id=$3';
            const values = [owner, repo,jobId];
            
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

    async insertRecordsIntoDatabase(records:JobDB[]) {
        const client = await this.pool.connect();
        try {

        for (const record of records) {
            const { id, sha, owner, reponame, conclusion } = record;
            const query = 'INSERT INTO jobsTable (id, sha, owner, repoName, conclusion) VALUES ($1, $2, $3, $4, $5)';
            const values = [id, sha, owner, reponame, conclusion];

            await client.query(query, values);
        }
        } catch (error) {
        console.error('Error inserting records:', error);
        } finally {
            if (client) {
                client.release();
            }
        }
    }
    async repositoryExist(owner: string, repoName: string) {
        const client = await this.pool.connect();
    
        const query =
        "SELECT COUNT(*) FROM jobsTable WHERE owner = $1 AND reponame = $2";
        const values = [owner, repoName];
    
        const result = await client.query(query, values);
        client.release();
    
        return result.rows[0].count > 0;
    }
}