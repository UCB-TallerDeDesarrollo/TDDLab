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

            const chat = model.startChat({
                history: [
                    {
                        role: 'user',
                        parts: [{ text: systemPrompt }]
                    },
                    {
                        role: 'model',
                        parts: [{ text: 'Entendido. Estoy listo para ayudarte.' }]
                    }
                ],
                generationConfig: {
                    temperature: this.config.temperature,
                    maxOutputTokens: this.config.maxTokens,
                }
            });

            const result = await chat.sendMessage(userContent);
            const response = result.response;
            
            if (response.candidates && response.candidates[0]?.finishReason === 'MAX_TOKENS') {
                console.warn('[Gemini Warning] Response truncated due to MAX_TOKENS limit');
                console.warn('[Gemini Warning] Consider increasing AI_MAX_TOKENS in .env');
            }
            
            const text = response.text();

            if (!text || text.trim().length === 0) {
                console.error('[Gemini Error] Empty response from model');
                console.error('[Gemini Debug] Full response:', JSON.stringify(response, null, 2));
                
                if (response.candidates && response.candidates[0]?.finishReason === 'MAX_TOKENS') {
                    throw new Error('El modelo alcanzó el límite de tokens. Aumenta AI_MAX_TOKENS en .env');
                }
                
                throw new Error('No se recibió una respuesta válida del modelo.');
            }

            return text;
        } catch (error) {
            if (error instanceof Error) {
                console.error('[AI Provider Error]', error.message);
                console.error('[AI Provider Stack]', error.stack);
            } else {
                console.error('[AI Provider Error]', error);
            }
            
            throw new Error('Error al comunicarse con el servicio de IA');
        }
    }
}
