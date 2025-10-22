import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIProvider, AIModelConfig } from '../../domain/IAIProvider';

export class GeminiProvider implements IAIProvider {
    private readonly genAI: GoogleGenerativeAI;
    private readonly config: AIModelConfig;

    constructor(apiKey: string, config?: Partial<AIModelConfig>) {
        if (!apiKey) {
            throw new Error('API Key es requerida para GeminiProvider');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.config = {
            model: config?.model || process.env.GEMINI_MODEL || '',
            temperature: config?.temperature ?? parseFloat(process.env.AI_TEMPERATURE || ''),
            maxTokens: config?.maxTokens ?? parseInt(process.env.AI_MAX_TOKENS || '', 10)
        };
    }

    getName(): string {
        return 'AI Assistant';
    }

    async sendRequest(systemPrompt: string, userContent: string): Promise<string> {
        try {
            const model = this.genAI.getGenerativeModel({
                model: this.config.model,
                generationConfig: {
                    temperature: this.config.temperature,
                    maxOutputTokens: this.config.maxTokens,
                }
            });

            const fullPrompt = `${systemPrompt}\n\n${userContent}`;
            const result = await model.generateContent(fullPrompt);
            const response = result.response;
            const text = response.text();

            if (!text) {
                throw new Error('No se recibió una respuesta válida del modelo.');
            }

            return text;
        } catch (error) {
            console.error('[AI Provider Error]', error instanceof Error ? error.message : 'Unknown error');
            throw new Error('Error al comunicarse con el servicio de IA');
        }
    }
}
