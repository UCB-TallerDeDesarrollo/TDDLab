import { AIAssistantAnswerObject, AIAssistantInstructionObject } from "../../domain/AIAssistant";

export class AnalyzeOrRefactorCodeUseCase {
    constructor(private aiAssistantAnswerObject: AIAssistantAnswerObject) { }

    async execute(instruction: AIAssistantInstructionObject): Promise<string> {
        return await this.aiAssistantAnswerObject.sendPrompt(instruction);
    }
}
