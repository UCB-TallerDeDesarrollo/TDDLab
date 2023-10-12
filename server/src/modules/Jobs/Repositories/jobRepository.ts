import { Pool } from 'pg'; // Import the Pool from 'pg'
import config from '../../../config/db';
// import { Job } from '../../domain/models/Job';


export class jobRepository {
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

    async insertRecordsIntoDatabase(records:{ id: number; sha: string; owner: string; reponame: string; conclusion: string; }[]) {
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
}