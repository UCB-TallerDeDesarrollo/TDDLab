import { AIAssistantPromptObject } from "../../domain/AIAssistant";
import { AIAssistantRepository } from "../../repository/AIAssistantRepositoy";

export class GetPromptsCodeUseCase {
    private readonly adapter: AIAssistantRepository;

    constructor(adapter: AIAssistantRepository) {
        this.adapter = adapter;
    }

    async execute(): Promise<AIAssistantPromptObject | null> {
        try {
            const prompts = await this.adapter.getPrompts();
            return prompts;
        } catch (err) {
            console.log("Error");
            throw err;
        }
    }
}
