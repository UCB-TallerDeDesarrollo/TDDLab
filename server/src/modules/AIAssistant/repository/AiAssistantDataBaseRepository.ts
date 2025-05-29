import dotenv from 'dotenv';
import { AIAssistantPromptObject } from '../domain/AIAssistant';
import { Pool } from 'pg';
import config from '../../../config/db';

dotenv.config();


const pool = new Pool(config);

export class AIAssistantDataBaseRepository {

    public async executeQuery(query: string, values?: any[]): Promise<any[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(query, values);
            return result.rows;
        } finally {
            client.release();
        }
    }

    public mapRowsToPromptAIAssistant(rows: any[]): AIAssistantPromptObject {
        const result: AIAssistantPromptObject = {};
        for (const row of rows) {
            result[row.name] = row.prompt;
        }
        return result;
    }
    

    public async getPrompts(): Promise<AIAssistantPromptObject> {
        const query = 'SELECT name, prompt FROM prompts_ia_temp_v2';
        const rows = await this.executeQuery(query);
    
        return this.mapRowsToPromptAIAssistant(rows);
    }

    public async updatePrompts(prompt: AIAssistantPromptObject): Promise<AIAssistantPromptObject> {
        const entries = Object.entries(prompt);
    
        for (const [name, newPrompt] of entries) {
            const query = `UPDATE prompts_ia_temp_v2 SET prompt = $1 WHERE name = $2`;
            const values = [newPrompt, name];
            await this.executeQuery(query, values);
        }
    
        return await this.getPrompts();
    }
}
