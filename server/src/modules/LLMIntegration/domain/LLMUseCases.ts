export interface LLMUseCase {
    generateText(prompt: string): Promise<string>;
  }