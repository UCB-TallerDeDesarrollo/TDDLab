export interface AIAssistantInstructionObject {
    URL: string;
    value: string;
}

export interface AIAssistantAnswerObject {
    sendPrompt(instruction: AIAssistantInstructionObject): Promise<string>;
}