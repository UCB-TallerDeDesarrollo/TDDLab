import { Pool } from 'pg'; // Import the Pool from 'pg'
import config from '../../config/db';
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

    // async saveJob(owner: String, repo: String, job: Job) {

    // }
}