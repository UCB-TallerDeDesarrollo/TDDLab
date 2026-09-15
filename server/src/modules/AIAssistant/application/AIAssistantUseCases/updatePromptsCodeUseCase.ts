import { AIAssistantPromptObject } from "../../domain/AIAssistant";
import { IAIAssistantDataBaseRepository } from "../../repository/IAIAssistantDataBaseRepository";

export class UpdatePromptsCodeUseCase {
    private readonly adapter: IAIAssistantDataBaseRepository;

    constructor(adapter: IAIAssistantDataBaseRepository) {
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