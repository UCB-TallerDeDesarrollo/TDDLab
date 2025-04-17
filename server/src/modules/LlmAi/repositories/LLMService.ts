export interface LLMService {
    sendPrompt(prompt: string): Promise<string>;
}