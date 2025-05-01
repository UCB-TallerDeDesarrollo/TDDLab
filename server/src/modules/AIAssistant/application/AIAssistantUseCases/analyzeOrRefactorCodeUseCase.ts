import { LLMService, Instruction } from '../../domain/AIAssistant';

export class AnalyzeOrRefactorCodeUseCase {
    constructor(private llmService: LLMService) { }

    async execute(instruction: Instruction): Promise<string> {
        return await this.llmService.sendPrompt(instruction);
    }
}
