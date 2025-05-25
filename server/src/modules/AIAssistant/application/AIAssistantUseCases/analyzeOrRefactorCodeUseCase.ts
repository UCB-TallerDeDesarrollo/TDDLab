import { AIAssistantAnswerObject, AIAssistantInstructionObject } from "../../domain/AIAssistant";
import { AIAssistantRepository } from "../../repository/AIAssistantRepositoy";

export class AnalyzeOrRefactorCodeUseCase {
    private readonly adapter: AIAssistantRepository;

    constructor(adapter: AIAssistantRepository) {
        this.adapter = adapter;
    }

    async execute(instruction: AIAssistantInstructionObject): Promise<AIAssistantAnswerObject> {
        return await this.adapter.sendPrompt(instruction);
    }
}
