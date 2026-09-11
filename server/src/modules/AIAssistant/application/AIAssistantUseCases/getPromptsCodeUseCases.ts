import { AIAssistantPromptObject } from "../../domain/AIAssistant";
import { IAIAssistantDataBaseRepository } from "../../repository/IAIAssistantDataBaseRepository";

export class GetPromptsCodeUseCase {
    private readonly adapter: IAIAssistantDataBaseRepository;

    constructor(adapter: IAIAssistantDataBaseRepository) {
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
