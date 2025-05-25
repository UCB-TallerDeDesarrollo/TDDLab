export interface AIAssistantInstructionObject {
    URL: string;
    value: string;
}

export interface AIAssistantAnswerObject {
    result: string;
}

export interface AIAssistantPromptObject {
    [key: string]: string;
}