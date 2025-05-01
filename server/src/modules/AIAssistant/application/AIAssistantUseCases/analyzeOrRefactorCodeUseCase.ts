import { AIAssistantAnswerObject, AIAssistantInstructionObject } from "../../domain/AIAssistant";

export class AnalyzeOrRefactorCodeUseCase {
    constructor(private llmService: AIAssistantAnswerObject) { }

    async execute(instruction: AIAssistantInstructionObject): Promise<string> {
        return await this.llmService.sendPrompt(instruction);
    }
}
