import axios from 'axios';
import dotenv from 'dotenv';
import { AIAssistantAnswerObject, AIAssistantInstructionObject, AIAssistantPromptObject } from '../domain/AIAssistant';
import { Pool } from 'pg';
import config from '../../../config/db';

dotenv.config();
const MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';


const pool = new Pool(config);

export class AIAssistantRepository {
    private readonly apiKey = process.env.TOGETHER_API_KEY;
    private readonly apiUrl = process.env.LLM_API_URL || '';

    public async executeQuery(query: string, values?: any[]): Promise<any[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(query, values);
            return result.rows;
        } finally {
            client.release();
        }
    }

    private mapToAIAssistantAnswer(data: any): AIAssistantAnswerObject {
        if (!data) {
            return { result: 'No se recibio ninguna respuesta del modelo.' };
        }
    
        if (data.error) {
            return { result: `Error del modelo: ${data.error}` };
        }
    
    
        return { result: data };
    }

    public mapRowToPromptAIAssistant(row: any): AIAssistantPromptObject {
        return {
            analysis_tdd: row.analysis_tdd,
            refactoring: row.refactoring,
        };
      }

    private buildPromt(instructionValue: string): string {
        const lower = instructionValue.toLowerCase();
        if (lower.includes('analiza')) return `Evalúa la cobertura de pruebas y si se aplican principios de TDD. ¿Qué áreas podrían mejorarse?`;
        if (lower.includes('refactoriza')) return `Evalúa este repositorio y sugiere mejoras usando principios de ingeniería de IA: claridad en las instrucciones, eficiencia en el contexto, uso adecuado de modelos, estructura del código y facilidad de mantenimiento`;
        return 'interpreta el siguiente código';
    }

    private async sendRequestToAIAssistant(code: string, instruction: string): Promise<string> {
        try {
            const userContent = `${instruction}\n\n${code}`;
            const response = await axios.post(
                this.apiUrl || (() => { throw new Error('LLM_API_URL no está definido'); })(),
                {
                    model: MODEL,
                    messages: [
                        { role: 'system', content: 'Eres un experto en desarrollo de software.' },
                        { role: 'user', content: userContent }
                    ],
                    temperature: 0.2,
                    max_tokens: 1024
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.data || !response.data.choices || !response.data.choices[0].message.content) {
                throw new Error('No se recibió una respuesta válida del modelo.');
            }

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('[LLM ERROR]', error);
            return 'Error al comunicarse con el modelo.';
        }
    }

    public async sendPrompt(instruction: AIAssistantInstructionObject): Promise<AIAssistantAnswerObject> {
        const newInstruction = this.buildPromt(instruction.value);
        const raw = await this.sendRequestToAIAssistant(instruction.URL, newInstruction);
        return this.mapToAIAssistantAnswer(raw);
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
}
