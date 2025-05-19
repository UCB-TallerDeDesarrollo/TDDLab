export interface AIAssistantInstructionObject {
    URL: string;
    value: string;
}

export interface AIAssistantAnswerObject {
    result: string;
}

export interface AIAssistantPromptObject {
    analysis_tdd: string;
    refactoring: string;
}   

export interface AIAssistantPromptObject2 {
    [key: string]: string; // flexible para nuevos tipos
}