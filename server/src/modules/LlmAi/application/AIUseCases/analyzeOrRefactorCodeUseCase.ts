import { LLMService, Instruction } from '../../domain/LlmAI';

export class AnalyzeOrRefactorCodeUseCase {
    constructor(private llmService: LLMService) { }

    async execute(instruction: Instruction): Promise<string> {
        return await this.llmService.sendPrompt(instruction);
    }
}
