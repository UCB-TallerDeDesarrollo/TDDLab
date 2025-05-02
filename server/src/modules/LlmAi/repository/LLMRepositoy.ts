import { LLMService, Instruction } from '../domain/LlmAI';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';
const MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

export class LLMRepository implements LLMService {
    private readonly apiKey = process.env.TOGETHER_API_KEY!;
    private readonly apiUrl = TOGETHER_API_URL;

    private buildInstruction(instructionValue: string): string {
        const lower = instructionValue.toLowerCase();
        if (lower.includes('analiza')) return `Evalúa la cobertura de pruebas y si se aplican principios de TDD. ¿Qué áreas podrían mejorarse?`;
        if (lower.includes('refactoriza')) return `Evalúa este repositorio y sugiere mejoras usando principios de ingeniería de IA: claridad en las instrucciones, eficiencia en el contexto, uso adecuado de modelos, estructura del código y facilidad de mantenimiento`;
        return 'interpreta el siguiente código';
    }

    private async executePostRequest(code: string, instruction: string): Promise<string> {
        try {
            const userContent = `${instruction}\n\n${code}`;
            const response = await axios.post(
                this.apiUrl,
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

            return response.data.choices[0].message.content || 'No se recibió respuesta del modelo.';
        } catch (error) {
            console.error('[LLM ERROR]', error);
            return 'Error al comunicarse con el modelo.';
        }
    }

    public async sendPrompt(instruction: Instruction): Promise<string> {
        const newInstruction = this.buildInstruction(instruction.value);
        return await this.executePostRequest(instruction.URL, newInstruction);
    }
}
