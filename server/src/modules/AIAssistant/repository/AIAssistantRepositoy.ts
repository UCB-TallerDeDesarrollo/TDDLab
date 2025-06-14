import dotenv from 'dotenv';
import { AIAssistantAnswerObject } from '../domain/AIAssistant';

dotenv.config();
const MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

export class AIAssistantRepository {
    private readonly apiKey = process.env.TOGETHER_API_KEY;
    private readonly apiUrl = process.env.LLM_API_URL || '';

    private mapToAIAssistantAnswer(data: any): AIAssistantAnswerObject {
        if (!data) {
            return { result: 'No se recibio ninguna respuesta del modelo.' };
        }

        if (data.error) {
            return { result: `Error del modelo: ${data.error}` };
        }

        return { result: data };
    }

    public buildPromptByTestExecuted(tddlog: any, promptInstructions: string): string {
        const tddlogString = JSON.stringify(tddlog, null, 2);

        return `
                  ${promptInstructions}
                  ${tddlogString}`;
    }

    public async sendRequestToAIAssistant(code: string, instruction: string): Promise<string> {
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
                        { role: 'system', content: 'Eres un experto en desarrollo de software, responde todo en español latino.' },
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

            if (!data?.choices?.[0]?.message?.content) {
                throw new Error('No se recibió una respuesta válida del modelo.');
            }

            return data.choices[0].message.content;

        } catch (error) {
            console.error('[LLM ERROR]', error);
            return 'Error al comunicarse con el modelo.';
        }
    }

    public async sendTDDExtensionPrompt(tddlog: any, promptInstructions: string): Promise<AIAssistantAnswerObject> {
        const prompt = this.buildPromptByTestExecuted(tddlog, promptInstructions);
        const raw = await this.sendRequestToAIAssistant(prompt, '');
        return this.mapToAIAssistantAnswer(raw);
    }

    public async sendChat(chatHistory: string, input: string): Promise<AIAssistantAnswerObject> {
        const raw = await this.sendRequestToAIAssistant(chatHistory, input);
        return this.mapToAIAssistantAnswer(raw);
    }
}