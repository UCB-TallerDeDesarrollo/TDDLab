import { ConversationService } from "../../repository/ChatbotMemoryRepository"; 

export class ChatbotCodeUseCase {
    private readonly convo: ConversationService;

    constructor() {
        this.convo = new ConversationService();
    }

    async execute(input: string): Promise<any> {
        try {
            const response = await this.convo.sendMessage(input);
            return response;
        } catch (error) {
            throw new Error("Error en el caso de uso del chatbot");
        }
    }
}