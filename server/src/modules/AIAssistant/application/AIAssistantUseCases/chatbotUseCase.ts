import { AIAssistantRepository } from '../../repository/AIAssistantRepositoy';

export class ChatbotUseCase {
    private readonly repository: AIAssistantRepository;

    constructor(repository: AIAssistantRepository) {
        this.repository = repository;
    }

    async execute(input: string): Promise<any> {
        try {
            const response = await this.repository.sendChat(input);
            return response;
        } catch (error) {
            throw new Error("Error en el caso de uso del chatbot");
        }
    }
}
