export interface IAIProvider {
    sendRequest(systemPrompt: string, userContent: string): Promise<string>;
    getName(): string;
}

export interface AIModelConfig {
    model: string;
    temperature: number;
    maxTokens: number;
}
