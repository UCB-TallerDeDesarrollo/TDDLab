import { AIAssistantPromptObject } from "../../domain/AIAssistant";
import { AIAssistantDataBaseRepository } from "../../repository/AiAssistantDataBaseRepository";

export class GetPromptsCodeUseCase {
    private readonly adapter: AIAssistantDataBaseRepository;

    constructor(adapter: AIAssistantDataBaseRepository) {
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
