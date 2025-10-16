import { IAIProvider, AIModelConfig } from '../../domain/IAIProvider';

export class TogetherAIProvider implements IAIProvider {
    private readonly apiKey: string;
    private readonly apiUrl: string;
    private readonly config: AIModelConfig;

    constructor(apiKey: string, apiUrl: string, config?: Partial<AIModelConfig>) {
        if (!apiKey) {
            throw new Error('API Key es requerida para TogetherAI');
        }
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.config = {
            model: config?.model || process.env.TOGETHER_MODEL || '',
            temperature: config?.temperature ?? parseFloat(process.env.AI_TEMPERATURE || ''),
            maxTokens: config?.maxTokens ?? parseInt(process.env.AI_MAX_TOKENS || '', 10)
        };
    }

    getName(): string {
        return 'AI Assistant';
    }

    async sendRequest(systemPrompt: string, userContent: string): Promise<string> {
        try {
            if (!this.apiUrl) {
                throw new Error('API URL no está definida');
            }

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.config.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userContent }
                    ],
                    temperature: this.config.temperature,
                    max_tokens: this.config.maxTokens
                }),
            });

            if (!response.ok) {
                throw new Error('Error al procesar la solicitud');
            }

            const data = await response.json();

            if (!data?.choices?.[0]?.message?.content) {
                throw new Error('No se recibió una respuesta válida del modelo.');
            }

            return data.choices[0].message.content;
        } catch (error) {
            console.error('[AI Provider Error]', error instanceof Error ? error.message : 'Unknown error');
            throw new Error('Error al comunicarse con el servicio de IA');
        }
    }
}
