import { IAIProvider, AIModelConfig } from '../../domain/IAIProvider';

export class GeminiProvider implements IAIProvider {
    private readonly apiKey: string;
    private readonly config: AIModelConfig;

    constructor(apiKey: string, config?: Partial<AIModelConfig>) {
        if (!apiKey) {
            throw new Error('API Key es requerida para GeminiProvider');
        }
        this.apiKey = apiKey;
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
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: `${systemPrompt}\n\n${userContent}` }
                        ]
                    }],
                    generationConfig: {
                        temperature: this.config.temperature,
                        maxOutputTokens: this.config.maxTokens,
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('Error al procesar la solicitud');
            }

            const data = await response.json();

            if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('No se recibió una respuesta válida del modelo.');
            }

            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('[AI Provider Error]', error instanceof Error ? error.message : 'Unknown error');
            throw new Error('Error al comunicarse con el servicio de IA');
        }
    }
}
