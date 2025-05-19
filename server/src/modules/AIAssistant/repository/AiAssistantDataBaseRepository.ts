import dotenv from 'dotenv';
import { AIAssistantPromptObject, AIAssistantPromptObject2 } from '../domain/AIAssistant';
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

    public mapRowToPromptAIAssistant(row: any): AIAssistantPromptObject {
        return {
            analysis_tdd: row.analysis_tdd,
            refactoring: row.refactoring,
        };
    }

    public mapRowsToPromptAIAssistant2(rows: any[]): AIAssistantPromptObject2 {
        const result: AIAssistantPromptObject2 = {};
        for (const row of rows) {
            result[row.name] = row.prompt;
        }
        return result;
    }
    

    public async getPrompts(): Promise<AIAssistantPromptObject2> {
        const query = 'SELECT name, prompt FROM prompts_ia_temp_v2';
        const rows = await this.executeQuery(query);
    
        return this.mapRowsToPromptAIAssistant2(rows);
    }

    public async updatePrompts2(prompt: AIAssistantPromptObject2): Promise<AIAssistantPromptObject2> {
        const entries = Object.entries(prompt);
    
        for (const [name, newPrompt] of entries) {
            const query = `UPDATE prompts_ia_temp_v2 SET prompt = $1 WHERE name = $2`;
            const values = [newPrompt, name];
            await this.executeQuery(query, values);
        }
    
        return await this.getPrompts();
    }

    public async updatePrompts(prompt: AIAssistantPromptObject): Promise<AIAssistantPromptObject | null> {
        const {
            analysis_tdd,
            refactoring
        } = prompt;

        const query = `UPDATE prompts_ia SET analysis_tdd = $1, refactoring = $2 WHERE id = $3 RETURNING analysis_tdd, refactoring`;
        const values = [
            analysis_tdd,
            refactoring,
            1
        ];

        const rows = await this.executeQuery(query, values);

        if (rows.length === 1) {
            return this.mapRowToPromptAIAssistant(rows[0]);
        }

        return null;
    }
}
