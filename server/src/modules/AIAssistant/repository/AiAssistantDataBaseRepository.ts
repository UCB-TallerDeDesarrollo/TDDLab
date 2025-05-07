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

    public mapRowToPromptAIAssistant(row: any): AIAssistantPromptObject {
        return {
            analysis_tdd: row.analysis_tdd,
            refactoring: row.refactoring,
        };
    }

    public async getPrompts(): Promise<AIAssistantPromptObject | null> {
        const query = 'SELECT analysis_tdd, refactoring FROM prompts_ia WHERE id = $1';
        const values = [1];

        const rows = await this.executeQuery(query, values);

        if (rows.length === 1) {
            return this.mapRowToPromptAIAssistant(rows[0]);
        }
        return null;
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
