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

            if (!this.apiUrl) {
                throw new Error('LLM_API_URL no está definido');
            }

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: 'system', content: 'Eres un experto en desarrollo de software.' },
                        { role: 'user', content: userContent }
                    ],
                    temperature: 0.2,
                    max_tokens: 1024
                }),
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data || !data.choices || !data.choices[0]?.message?.content) {
                throw new Error('No se recibió una respuesta válida del modelo.');
            }

            return data.choices[0].message.content;

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


/*
import dotenv from 'dotenv';
import { AIAssistantAnswerObject, AIAssistantInstructionObject } from '../domain/AIAssistant';

dotenv.config();
const MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

export class AIAssistantRepository {
    private readonly apiKey = process.env.TOGETHER_API_KEY;
    private readonly apiUrl = process.env.LLM_API_URL || '';

    private mapToAIAssistantAnswer(data: any): AIAssistantAnswerObject {
        if (!data) {
            return { result: 'No se recibió ninguna respuesta del modelo.' };
        }
    
        if (data.error) {
            return { result: Error del modelo: ${data.error} };
        }
    
        return { result: data };
    }
    

    private buildPromt(instructionValue: string): string {
        const lower = instructionValue.toLowerCase();
        if (lower.includes('analiza')) return Evalúa la cobertura de pruebas y si se aplican principios de TDD. ¿Qué áreas podrían mejorarse?;
        if (lower.includes('refactoriza')) return Evalúa este repositorio y sugiere mejoras usando principios de ingeniería de IA: claridad en las instrucciones, eficiencia en el contexto, uso adecuado de modelos, estructura del código y facilidad de mantenimiento;
        return 'interpreta el siguiente código';
    }

    private async sendRequestToAIAssistant(code: string, instruction: string): Promise<string> {
        try {
            const userContent = ${instruction}\n\n${code};

            if (!this.apiUrl) {
                throw new Error('LLM_API_URL no está definido');
            }

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': Bearer ${this.apiKey},
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: 'system', content: 'Eres un experto en desarrollo de software.' },
                        { role: 'user', content: userContent }
                    ],
                    temperature: 0.2,
                    max_tokens: 1024
                }),
            });

            if (!response.ok) {
                throw new Error(Error HTTP: ${response.status});
            }

            const data = await response.json();

            if (!data.choices?.[0]?.message?.content) {
                throw new Error('No se recibió una respuesta válida del modelo.');
            }

            return data.choices[0].message.content;
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
}
*/