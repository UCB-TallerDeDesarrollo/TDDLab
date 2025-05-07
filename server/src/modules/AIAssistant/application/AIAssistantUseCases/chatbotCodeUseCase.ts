import { AIAssistantRepository } from '../../repository/AIAssistantRepositoy';

export class ChatbotCodeUseCase {
    private readonly repository: AIAssistantRepository;

    constructor(repository: AIAssistantRepository) {
        this.repository = repository;
    }

    // Este método recibe el input del usuario y lo envía al repositorio
    async execute(input: string): Promise<any> {
        try {
            // Usamos el repositorio para obtener la respuesta del chatbot
            const response = await this.repository.sendChat(input); // Reutilizamos sendChat
            return response;
        } catch (error) {
            throw new Error("Error en el caso de uso del chatbot");
        }
    }
}
