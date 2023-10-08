import { Pool } from 'pg'; // Import the Pool from 'pg'
import config from '../../config/db';
import { Job } from '../../domain/models/Job';


export class jobRepository{
    pool:Pool
    constructor(){
        this.pool=new Pool(config)
    }
    async getJob() {
      }

    async saveJob(owner: String, repo: String, job: Job){
        
    }
}