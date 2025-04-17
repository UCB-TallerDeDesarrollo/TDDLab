import { LLMService } from '../../repositories/LLMService';

export class AnalyzeOrRefactorCodeUseCase {
    constructor(private llmService: LLMService) { }

    async execute(prompt: string): Promise<string> {
        return await this.llmService.sendPrompt(prompt);
    }
}
