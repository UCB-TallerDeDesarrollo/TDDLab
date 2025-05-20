import { AIAssistantPromptObject } from "../../domain/AIAssistant";
import { AIAssistantDataBaseRepository } from "../../repository/AiAssistantDataBaseRepository";

export class UpdatePromptsCodeUseCase {
    private readonly adapter: AIAssistantDataBaseRepository;

    constructor(adapter: AIAssistantDataBaseRepository) {
        this.adapter = adapter;
    }

    async execute(prompt: AIAssistantPromptObject): Promise<AIAssistantPromptObject | null> {
        try {
            const prompts = await this.adapter.updatePrompts(prompt);
            return prompts;
        } catch (err) {
            console.log("Error");
            throw err;
        }
    }
}