import { AIAssistantRepository } from '../../repository/AIAssistantRepositoy';

export class AnalyzeTDDUseCase {
    constructor(private readonly repository: AIAssistantRepository) {}

    public async execute(tddlog: any, promptInstructions: string): Promise<string> {
        const prompt = this.repository.buildPromptByTestExecuted(tddlog, promptInstructions);
        const response = await this.repository.sendPrompt({
            URL: 'internal-tdd-analysis',
            value: prompt
        });
        return response.result;
    }
}