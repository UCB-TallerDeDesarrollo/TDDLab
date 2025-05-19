import { AIAssistantPromptObject2 } from "../../domain/AIAssistant";
import { AIAssistantDataBaseRepository } from "../../repository/AiAssistantDataBaseRepository";

export class UpdatePromptsCodeUseCase {
    private readonly adapter: AIAssistantDataBaseRepository;

    constructor(adapter: AIAssistantDataBaseRepository) {
        this.adapter = adapter;
    }

    async execute(prompt: AIAssistantPromptObject2): Promise<AIAssistantPromptObject2 | null> {
        try {
            const prompts = await this.adapter.updatePrompts2(prompt);
            return prompts;
        } catch (err) {
            console.log("Error");
            throw err;
        }
    }
}