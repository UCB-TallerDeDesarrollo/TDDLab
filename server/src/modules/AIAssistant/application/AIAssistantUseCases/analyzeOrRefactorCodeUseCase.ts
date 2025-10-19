import { AIAssistantAnswerObject, AIAssistantInstructionObject } from "../../domain/AIAssistant";
import { ChatbotAssistantRepository } from "../../repository/ChatbotAssistantRepository";

export class AnalyzeOrRefactorCodeUseCase {
    private readonly adapter: ChatbotAssistantRepository;

    constructor(adapter: ChatbotAssistantRepository) {
        this.adapter = adapter;
    }

    async execute(instruction: AIAssistantInstructionObject): Promise<AIAssistantAnswerObject> {
        return await this.adapter.sendPrompt(instruction);
    }
}
