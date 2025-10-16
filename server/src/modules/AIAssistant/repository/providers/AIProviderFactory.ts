import { IAIProvider, AIModelConfig } from '../../domain/IAIProvider';
import { TogetherAIProvider } from './TogetherAIProvider';
import { GeminiProvider } from './GeminiProvider';

export type AIProviderType = 'together' | 'gemini';

export class AIProviderFactory {
    static createProvider(
        providerType: AIProviderType,
        apiKey: string,
        apiUrl?: string,
        config?: Partial<AIModelConfig>
    ): IAIProvider {
        switch (providerType) {
            case 'together':
                if (!apiUrl) {
                    throw new Error('API URL es requerida para TogetherAI');
                }
                return new TogetherAIProvider(apiKey, apiUrl, config);
            
            case 'gemini':
                return new GeminiProvider(apiKey, config);
            
            default:
                throw new Error(`Proveedor de IA no soportado: ${providerType}`);
        }
    }
}
