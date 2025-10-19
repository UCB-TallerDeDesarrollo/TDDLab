import { AIAssistantRepository } from '../../repository/AIAssistantRepositoy';

export class AnalyzeTDDCodeUseCase {
    constructor(private readonly repository: AIAssistantRepository) {}

    public async execute(tddlog: any, promptInstructions: string): Promise<string> {
        const response = await this.repository.sendTDDExtensionPrompt(tddlog, promptInstructions);
        return response.result;
    }
}