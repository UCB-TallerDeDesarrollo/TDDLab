export interface Instruction {
    URL: string;
    value: string;
}

export interface LLMService {
    sendPrompt(instruction: Instruction): Promise<string>;
}