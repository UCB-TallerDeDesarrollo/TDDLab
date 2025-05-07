import { AIAssistantPromptObject } from "../../domain/AIAssistant";
import { AIAssistantRepository } from "../../repository/AIAssistantRepositoy";

export class UpdatePromptsCodeUseCase {
    private readonly adapter: AIAssistantRepository;

    constructor(adapter: AIAssistantRepository) {
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