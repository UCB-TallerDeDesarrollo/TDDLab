import dotenv from 'dotenv';
import { AIAssistantAnswerObject } from '../domain/AIAssistant';
import { IAIProvider } from '../domain/IAIProvider';
import { AIProviderFactory, AIProviderType } from './providers/AIProviderFactory';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

export class AIAssistantRepository {
    private readonly provider: IAIProvider;
    private readonly systemPrompt: string;

    constructor(providerType?: AIProviderType) {
        const type = providerType || (process.env.AI_PROVIDER as AIProviderType);
        const apiKey = process.env.MODEL_API_KEY || '';
        const apiUrl = process.env.LLM_API_URL;

        this.provider = AIProviderFactory.createProvider(type, apiKey, apiUrl);
        this.systemPrompt = this.loadSystemPrompt();
    }

    private loadSystemPrompt(): string {
        try {
            const promptPath = path.join(__dirname, '../config/prompts.txt');
            return fs.readFileSync(promptPath, 'utf-8').trim();
        } catch (error) {
            console.warn('Sistema de prompts no disponible');
            return '';
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

    public buildPromptByTestExecuted(tddlog: any, promptInstructions: string): string {
        const tddlogString = JSON.stringify(tddlog, null, 2);

        return `
                  ${promptInstructions}
                  ${tddlogString}`;
    }

    public async sendRequestToAIAssistant(code: string, instruction: string): Promise<string> {
        try {
            const userContent = `${instruction}\n\n${code}`;
            return await this.provider.sendRequest(this.systemPrompt, userContent);
        } catch (error) {
            console.error('[AI Service Error]', error instanceof Error ? error.message : 'Unknown error');
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