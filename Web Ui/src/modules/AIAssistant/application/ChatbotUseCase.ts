import { ChatbotRepository } from '../repository/ChatBotRepository';

export class ChatbotUseCase {
  private readonly chatbotRepository: ChatbotRepository;

  constructor() {
    this.chatbotRepository = new ChatbotRepository();
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const response = await this.chatbotRepository.sendMessage(message);
      return response;
    } catch (error: any) {
      throw new Error(`Error al enviar el mensaje al chatbot: ${error.message ?? error}`);
    }
  }
}

