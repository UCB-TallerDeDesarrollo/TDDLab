import axios from 'axios';
import dotenv from 'dotenv';
import { AIAssistantAnswerObject, AIAssistantInstructionObject } from '../domain/AIAssistant';
import { AIAssistantDataBaseRepository } from './AiAssistantDataBaseRepository';

dotenv.config();
const MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

export class AIAssistantRepository {
    private readonly apiKey = process.env.TOGETHER_API_KEY;
    private readonly apiUrl = process.env.LLM_API_URL || '';
    private readonly aiAssistantDB = new AIAssistantDataBaseRepository;

    private mapToAIAssistantAnswer(data: any): AIAssistantAnswerObject {
        if (!data) {
            return { result: 'No se recibio ninguna respuesta del modelo.' };
        }

        if (data.error) {
            return { result: `Error del modelo: ${data.error}` };
        }


        return { result: data };
    }

    private async buildPromt(instructionValue: string): Promise<string> {
        const prompts = await this.aiAssistantDB.getPrompts();
        const lower = instructionValue.toLowerCase();
        if (lower.includes('analiza')) return prompts?.analysis_tdd || 'Prompt no disponible para la evaluación de la aplicación de TDD.';
        if (lower.includes('refactoriza')) return prompts?.refactoring || 'Prompt no disponible para la evaluación de la aplicación de refactoring.';
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
        const newInstruction = await this.buildPromt(instruction.value);
        const raw = await this.sendRequestToAIAssistant(instruction.URL, newInstruction);
        return this.mapToAIAssistantAnswer(raw);
    }
}
